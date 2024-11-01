import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'auth/decorators/public.decorator';
import { Roles } from 'auth/decorators/roles.decorator';
import { Role } from 'auth/roles/enums/role.enum';
import { IdDto } from 'common/dto/id.dto';
import { IdFilenameDto } from 'files/dto/id-filename.dto';
import { BodyInterceptor } from 'files/interceptors/body/body.interceptor';
import { FileSchema } from 'files/swagger/schemas/file.schema';
import { FilesSchema } from 'files/swagger/schemas/files.schema';
import { createParseFilePipe } from 'files/util/file-validation.util';
import {
  MaxFileCount,
  MULTIPART_FORM_DATA_KEY,
} from 'files/util/file.constants';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsQueryDto } from './dto/querying/products-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Roles(Role.MANAGER)
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Public()
  @Get()
  findAll(@Query() productsQueryDto: ProductsQueryDto) {
    return this.productsService.findAll(productsQueryDto);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Roles(Role.MANAGER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Roles(Role.MANAGER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }

  @ApiConsumes(MULTIPART_FORM_DATA_KEY)
  @ApiBody({
    type: FilesSchema,
  })
  @Roles(Role.MANAGER)
  @UseInterceptors(FilesInterceptor('files', MaxFileCount.PRODUCT_IMAGES))
  @Post(':id/images')
  uploadImage(
    @Param() { id }: IdDto,
    @UploadedFiles(createParseFilePipe('2MB', 'png', 'jpeg'))
    files: Express.Multer.File[],
  ) {
    return this.productsService.uploadImage(id, files);
  }

  @ApiConsumes(MULTIPART_FORM_DATA_KEY)
  @ApiBody({
    type: FilesSchema,
  })
  @Roles(Role.MANAGER)
  @UseInterceptors(
    FilesInterceptor('files', MaxFileCount.PRODUCT_IMAGES),
    BodyInterceptor,
  )
  @Post('/images')
  async createProductWithImage(
    @UploadedFiles(createParseFilePipe('2MB', 'png', 'jpeg'))
    files: Express.Multer.File[],
    @Body() createProductDto: CreateProductDto,
  ) {
    const product = await this.productsService.create(createProductDto);
    return this.productsService.uploadImage(product.id, files);
  }

  @ApiOkResponse({ type: FileSchema })
  @Public()
  @Get(':id/images/:filename')
  downloadImage(@Param() { id, filename }: IdFilenameDto) {
    return this.productsService.downloadImage(id, filename);
  }

  @Roles(Role.MANAGER)
  @Delete(':id/images/:filename')
  deleteImage(@Param() { id, filename }: IdFilenameDto) {
    return this.productsService.deleteImage(id, filename);
  }
}
