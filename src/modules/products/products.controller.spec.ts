import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProductService = {
    create: jest.fn((dto) => ({
      id: 'a uuid',
      ...dto,
    })),
    findAll: jest.fn(() => []),
    findOne: jest.fn((term) => ({
      id: 'a uuid',
      title: `Product with term ${term}`,
    })),
    update: jest.fn((id, dto) => ({
      id,
      ...dto,
    })),
    remove: jest.fn((id) => ({
      id,
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a product', async () => {
    const createProductDto: CreateProductDto = {
      title: 'Test Product',
      price: 10,
      sizes: ['M'],
      gender: 'men',
    };
    expect(await controller.create(createProductDto)).toEqual({
      id: expect.any(String),
      ...createProductDto,
    });
    expect(service.create).toHaveBeenCalledWith(createProductDto);
  });

  it('should return an array of products', async () => {
    const paginationDto: PaginationDto = { limit: 10, offset: 0 };
    expect(await controller.findAll(paginationDto)).toEqual([]);
    expect(service.findAll).toHaveBeenCalledWith(paginationDto);
  });

  it('should return a single product', async () => {
    const term = 'Test';
    expect(await controller.findOne(term)).toEqual({
      id: expect.any(String),
      title: `Product with term ${term}`,
    });
    expect(service.findOne).toHaveBeenCalledWith(term);
  });

  it('should update a product', async () => {
    const id = 'a uuid';
    const updateProductDto: UpdateProductDto = {
      title: 'Updated Product',
      price: 20,
    };
    expect(await controller.update(id, updateProductDto)).toEqual({
      id,
      ...updateProductDto,
    });
    expect(service.update).toHaveBeenCalledWith(id, updateProductDto);
  });

  it('should remove a product', async () => {
    const id = 'a uuid';
    expect(await controller.remove(id)).toEqual({ id });
    expect(service.remove).toHaveBeenCalledWith(id);
  });
});
