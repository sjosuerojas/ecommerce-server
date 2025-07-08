import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { DataSource, QueryRunner, Repository } from 'typeorm';

import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { createTransactionRunner } from '../../utils/transaction.util';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly pImageRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Creates a new product in the database.
   * @param createProductDto - Data transfer object containing product details.
   * @returns The created product.
   * @throws InternalServerErrorException if there's an error during the creation process.
   */
  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { images = [], ...productDetails } = createProductDto;

    const imageEntities = images.map((url) =>
      this.pImageRepository.create({ url }),
    );

    const product = this.productRepository.create({
      ...productDetails,
      images: imageEntities,
    });

    try {
      return await this.productRepository.save(product);
    } catch (error) {
      this.logger.error(
        `Error creating product ${product.title}: ${(error as { message: string }).message}`,
      );
      throw new InternalServerErrorException('Cannot create the product');
    }
  }

  /**
   * Retrieves a list of products from the database with pagination.
   * @param paginationDto - Data transfer object containing pagination details.
   * @returns A list of products.
   * @throws InternalServerErrorException if there's an error during the retrieval process.
   */
  async findAll(paginationDto: PaginationDto): Promise<Product[]> {
    try {
      const { limit = 0, offset = 0 } = paginationDto;
      return await this.productRepository.find({
        take: limit,
        skip: offset,
        relations: { images: true },
      });
    } catch (error) {
      this.logger.error(
        `Error finding product collection: ${(error as { message: string }).message}`,
      );
      throw new InternalServerErrorException(`Cannot find products`);
    }
  }

  /**
   * Retrieves a single product by either its UUID, title, or slug.
   * @param term - The search term, which can be a UUID, title, or slug.
   * @returns The found product.
   * @throws BadRequestException if the product does not exist.
   * @throws InternalServerErrorException if there's an error during the retrieval process.
   */
  async findOne(term: string): Promise<Product> {
    try {
      const product = isUUID(term)
        ? await this.productRepository.findOneBy({ id: term })
        : await this.productRepository
            .createQueryBuilder('p')
            .where(`UPPER(title) = :title OR slug = :slug`, {
              title: term.toUpperCase(),
              slug: term.toLowerCase(),
            })
            .leftJoinAndSelect('p.images', 'pImg')
            .getOne();

      if (!product) {
        throw new BadRequestException(
          `Product with term ${term} does not exist`,
        );
      }

      return product;
    } catch (error) {
      this.logger.error(
        `Error finding product ${term}: ${(error as { message: string }).message}`,
      );
      throw new InternalServerErrorException(`Cannot find productId: ${term}`);
    }
  }

  /**
   * Updates an existing product in the database.
   * @param id - The UUID of the product to update.
   * @param updateProductDto - Data transfer object containing updated product details.
   * @returns The updated product.
   * @throws NotFoundException if the product is not found.
   * @throws InternalServerErrorException if there's an error during the update process.
   */
  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const { images, ...rest } = updateProductDto;
    const product = await this.productRepository.preload({ id, ...rest });

    if (!product || !images)
      throw new NotFoundException(`Product with id: ${id} not found`);

    try {
      return createTransactionRunner(this.dataSource, async (queryRunner) =>
        this.getOrUpdateOne(queryRunner, { id, images, product }),
      );
    } catch (error) {
      this.logger.error(
        `Error updating product ${id}: ${(error as { message: string }).message}`,
      );
      throw new InternalServerErrorException(`Cannot update productId: ${id}`);
    }
  }

  /**
   * Removes a product from the database.
   * @param id - The UUID of the product to remove.
   * @returns The removed product.
   * @throws InternalServerErrorException if there's an error during the removal process.
   */
  async remove(id: string): Promise<void> {
    try {
      const product = await this.findOne(id);
      await this.productRepository.remove(product);
    } catch (error) {
      this.logger.error(
        `Error deleting product ${id}: ${(error as { message: string }).message}`,
      );
      throw new InternalServerErrorException(`Cannot remove productId: ${id}`);
    }
  }

  /**
   * Get or Update the product image reference in database
   * @param queryRunner - Instance of TypeOrm queryRunner
   * @returns The updated product.
   */
  async getOrUpdateOne(
    queryRunner: QueryRunner,
    { id, images, product }: { id: string; images: string[]; product: Product },
  ): Promise<Product> {
    {
      if (!images) {
        product.images = await this.productRepository
          .createQueryBuilder('product')
          .leftJoinAndSelect('product.images', 'images')
          .where('product.id = :id', { id })
          .getOne()
          .then((p) => (p ? p.images : []));
      } else {
        await queryRunner.manager.delete(ProductImage, { product: { id } });
        product.images = images.map((url) =>
          this.pImageRepository.create({ url }),
        );
      }

      return await queryRunner.manager.save(product);
    }
  }
}
