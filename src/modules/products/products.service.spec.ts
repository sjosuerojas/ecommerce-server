import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

const mockProductRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  preload: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  })),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepository: MockRepository<Product>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useFactory: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepository = module.get<MockRepository<Product>>(
      getRepositoryToken(Product),
    );
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const createProductDto: CreateProductDto = {
        title: 'Product',
        price: 10,
        sizes: ['M'],
        gender: 'men',
      };
      const product = { id: '1', ...createProductDto };

      productRepository.create.mockReturnValue(product);
      productRepository.save.mockResolvedValue(product);

      expect(await service.create(createProductDto)).toEqual(product);
      expect(productRepository.create).toHaveBeenCalledWith(createProductDto);
      expect(productRepository.save).toHaveBeenCalledWith(product);
    });

    it('should throw an InternalServerErrorException on error', async () => {
      const createProductDto: CreateProductDto = {
        title: 'Product',
        price: 10,
        sizes: ['M'],
        gender: 'men',
      };
      productRepository.save.mockRejectedValue(new Error('Test error'));

      await expect(service.create(createProductDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const paginationDto: PaginationDto = { limit: 10, offset: 0 };
      const products = [
        { id: '1', title: 'Product 1', price: 10, sizes: ['M'], gender: 'men' },
        { id: '2', title: 'Product 2', price: 20, sizes: ['S'], gender: 'men' },
      ];

      productRepository.find.mockResolvedValue(products);

      expect(await service.findAll(paginationDto)).toEqual(products);
      expect(productRepository.find).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
      });
    });

    it('should throw an InternalServerErrorException on error', async () => {
      productRepository.find.mockRejectedValue(new Error('Test error'));

      await expect(service.findAll({})).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a product by UUID', async () => {
      const product = {
        id: '1',
        title: 'Product',
        price: 10,
        sizes: ['M'],
        gender: 'men',
      };
      productRepository.findOneBy.mockResolvedValue(product);

      expect(await service.findOne('1')).toEqual(product);
      expect(productRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
    });

    it('should return a product by title or slug', async () => {
      const product = { id: '1', title: 'Product', slug: 'product', price: 10 };
      productRepository.createQueryBuilder().getOne.mockResolvedValue(product);

      expect(await service.findOne('Product')).toEqual(product);
      expect(productRepository.createQueryBuilder().where).toHaveBeenCalledWith(
        `UPPER(title) = :title OR slug = :slug`,
        { title: 'PRODUCT', slug: 'product' },
      );
    });

    it('should throw a BadRequestException if product not found', async () => {
      productRepository.findOneBy.mockResolvedValue(null);
      await expect(service.findOne('1')).rejects.toThrow(BadRequestException);
    });

    it('should throw an InternalServerErrorException on error', async () => {
      productRepository.findOneBy.mockRejectedValue(new Error('Test error'));

      await expect(service.findOne('1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    it('should update and return the product', async () => {
      const updateProductDto: UpdateProductDto = {
        title: 'Updated Product',
        sizes: ['M'],
        gender: 'men',
      };
      const product = { id: '1', ...updateProductDto };

      productRepository.preload.mockResolvedValue(product);
      productRepository.save.mockResolvedValue(product);

      expect(await service.update('1', updateProductDto)).toEqual(product);
      expect(productRepository.preload).toHaveBeenCalledWith({
        id: '1',
        ...updateProductDto,
      });
      expect(productRepository.save).toHaveBeenCalledWith(product);
    });

    it('should throw a NotFoundException if product not found', async () => {
      productRepository.preload.mockResolvedValue(null);
      await expect(service.update('1', {})).rejects.toThrow(NotFoundException);
    });

    it('should throw an InternalServerErrorException on error', async () => {
      productRepository.preload.mockRejectedValue(new Error('Test error'));
      await expect(service.update('1', {})).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('remove', () => {
    it('should remove and return the product', async () => {
      const product = {
        id: '1',
        title: 'Product',
        price: 10,
        sizes: ['M'],
        gender: 'men',
      };
      productRepository.findOneBy.mockResolvedValue(product);
      productRepository.remove.mockResolvedValue(product);

      expect(await service.remove('1')).toEqual(product);
      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(productRepository.remove).toHaveBeenCalledWith(product);
    });

    it('should throw an InternalServerErrorException on error', async () => {
      productRepository.findOneBy.mockRejectedValue(new Error('Test error'));

      await expect(service.remove('1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
