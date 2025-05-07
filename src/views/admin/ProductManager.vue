<template>
  <q-page class="q-pa-md">
    <div class="q-mb-md row justify-between items-center">
      <h1 class="text-h4">Product Manager</h1>
      <q-btn 
        @click="newProduct = !newProduct" 
        color="primary" 
        label="Add Product" 
        icon="add"
      />
    </div>

    <q-dialog v-model="newProduct" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center">
          <div class="text-h6">Add New Product</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="addProduct" class="q-gutter-md">
            <q-input
              v-model="newProductData.name"
              label="Product Name"
              outlined
              dense
              :rules="[val => !!val || 'Field is required']"
            />

            <q-input
              v-model="newProductData.sku"
              label="SKU"
              outlined
              dense
            />

            <q-select
              v-model="newProductData.category"
              :options="categoryOptions.filter(opt => opt.value)"
              label="Category"
              outlined
              dense
              emit-value
              map-options
              :rules="[val => !!val || 'Field is required']"
            />

            <q-input
              v-model.number="newProductData.price"
              label="Price"
              type="number"
              outlined
              dense
              :rules="[
                val => !!val || 'Field is required',
                val => val > 0 || 'Price must be positive'
              ]"
            />

            <q-input
              v-model.number="newProductData.stock_quantity"
              label="Stock Quantity"
              type="number"
              outlined
              dense
              :rules="[
                val => val >= 0 || 'Cannot be negative',
                val => Number.isInteger(val) || 'Must be whole number'
              ]"
            />

            <q-select
              v-model="newProductData.status"
              :options="statusOptions.filter(opt => opt.value)"
              label="Status"
              outlined
              dense
              emit-value
              map-options
              :rules="[val => !!val || 'Field is required']"
            />

            <q-file
              v-model="newProductImages"
              label="Product Images"
              outlined
              dense
              multiple
              accept=".jpg, image/*"
              @rejected="onRejectedFiles"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn 
                label="Cancel" 
                color="negative" 
                v-close-popup 
                flat
              />
              <q-btn 
                label="Add Product" 
                type="submit" 
                color="primary"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-card class="q-mb-md">
      <q-card-section class="row justify-between items-center">
        <q-input
          v-model="searchQuery"
          placeholder="Search products..."
          dense
          outlined
          class="col-md-4 col-sm-6 col-xs-12"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <div class="row q-gutter-sm">
          <q-select
            v-model="categoryFilter"
            :options="categoryOptions"
            outlined
            dense
            label="Category"
            style="min-width: 150px"
          />
          
          <q-select
            v-model="statusFilter"
            :options="statusOptions"
            outlined
            dense
            label="Status"
            style="min-width: 150px"
          />
        </div>
      </q-card-section>

      <q-table
        :rows="paginatedProducts"
        :columns="columns"
        row-key="id"
        flat
        bordered
        :pagination="pagination"
        @request="onRequest"
        :loading="loading"
      >
        <template v-slot:body-cell-product="props">
          <q-td :props="props">
            <div class="row items-center">
              <q-avatar size="40px" class="q-mr-sm">
                <img :src="props.row.image_urls[0]" :alt="props.row.name">
              </q-avatar>
              <div>
                <div class="text-weight-medium">{{ props.row.name }}</div>
                <div class="text-caption text-grey">SKU: {{ props.row.sku }}</div>
              </div>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-badge :color="getStatusColor(props.row.status)">
              {{ props.row.status }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn 
              flat 
              round 
              color="primary" 
              icon="edit" 
              @row-click="(evt, row: any) => editProduct(row.id)"
            />
            <q-btn 
              flat 
              round 
              color="negative" 
              icon="delete" 
              @click="confirmDelete(props.row.id)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import useApi from '@/composables/useApi';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock_quantity: number;
  status: string;
  image_urls: string[];
}

const $q = useQuasar();
const { fetchProducts } = useApi();

const searchQuery = ref('');
const categoryFilter = ref('');
const statusFilter = ref('');
const loading = ref(false);
const newProduct = ref(false);
const newProductData = ref<Product>({
  id: '',
  name: '',
  sku: '',
  category: '',
  price: 0,
  stock_quantity: 0,
  status: 'draft',
  image_urls: []
});
const newProductImages = ref<File[]>([]);

const columns = [
  {
    name: 'product',
    required: true,
    label: 'Product',
    align: 'left',
    field: 'name',
    sortable: true
  },
  {
    name: 'category',
    label: 'Category',
    field: 'category',
    align: 'left',
    sortable: true
  },
  {
    name: 'price',
    label: 'Price',
    field: 'price',
    align: 'left',
    sortable: true,
    format: val => `$${val.toFixed(2)}`
  },
  {
    name: 'stock',
    label: 'Stock',
    field: 'stock_quantity',
    align: 'left',
    sortable: true
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    align: 'left',
    sortable: true
  },
  {
    name: 'actions',
    label: 'Actions',
    align: 'right',
    field: 'actions'
  }
];

const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
});

const categoryOptions = [
  { label: 'All Categories', value: '' },
  { label: 'Electronics', value: 'Electronics' },
  { label: 'Clothing', value: 'Clothing' },
  { label: 'Home', value: 'Home' },
  { label: 'Books', value: 'Books' },
  { label: 'Toys', value: 'Toys' }
];

const statusOptions = [
  { label: 'All Statuses', value: '' },
  { label: 'Published', value: 'published' },
  { label: 'Draft', value: 'draft' },
  { label: 'Archived', value: 'archived' }
];

const products = ref<Product[]>([
  { id: '1', name: 'Wireless Headphones', sku: 'WH-1000', category: 'Electronics', price: 199.99, stock_quantity: 45, status: 'published', image_urls: ['https://example.com/headphones.jpg'] },
  { id: '2', name: 'Cotton T-Shirt', sku: 'CT-200', category: 'Clothing', price: 24.99, stock_quantity: 120, status: 'published', image_urls: ['https://example.com/tshirt.jpg'] },
  { id: '3', name: 'Smart Watch', sku: 'SW-300', category: 'Electronics', price: 249.99, stock_quantity: 30, status: 'published', image_urls: ['https://example.com/watch.jpg'] },
  { id: '4', name: 'Coffee Table Book', sku: 'CTB-400', category: 'Books', price: 39.99, stock_quantity: 25, status: 'draft', image_urls: ['https://example.com/book.jpg'] },
  { id: '5', name: 'Throw Pillow', sku: 'TP-500', category: 'Home', price: 19.99, stock_quantity: 80, status: 'published', image_urls: ['https://example.com/pillow.jpg'] },
  { id: '6', name: 'Bluetooth Speaker', sku: 'BS-600', category: 'Electronics', price: 89.99, stock_quantity: 15, status: 'published', image_urls: ['https://example.com/speaker.jpg'] },
  { id: '7', name: 'Running Shoes', sku: 'RS-700', category: 'Clothing', price: 79.99, stock_quantity: 50, status: 'published', image_urls: ['https://example.com/shoes.jpg'] },
  { id: '8', name: 'Desk Lamp', sku: 'DL-800', category: 'Home', price: 34.99, stock_quantity: 40, status: 'archived', image_urls: ['https://example.com/lamp.jpg'] },
]);

const filteredProducts = computed(() => {
  let result = products.value;
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.sku.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    );
  }
  
  if (categoryFilter.value) {
    result = result.filter(p => p.category === categoryFilter.value);
  }
  
  if (statusFilter.value) {
    result = result.filter(p => p.status === statusFilter.value);
  }
  
  return result;
});

const paginatedProducts = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.rowsPerPage;
  const end = start + pagination.value.rowsPerPage;
  return filteredProducts.value.slice(start, end);
});

const getStatusColor = (status: string) => {
  switch(status.toLowerCase()) {
    case 'published': return 'positive';
    case 'draft': return 'warning';
    case 'archived': return 'grey';
    default: return 'grey';
  }
};

const confirmDelete = (productId: string) => {
  $q.dialog({
    title: 'Confirm Delete',
    message: 'Are you sure you want to delete this product?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    products.value = products.value.filter(p => p.id !== productId);
    $q.notify({
      type: 'positive',
      message: 'Product deleted successfully'
    });
  });
};

function onRequest(props: any) {
  pagination.value = props.pagination;
}

const editProduct = (productId: string) => {
  newProduct.value = true;
  const product = products.value.find(p => p.id === productId);
  if (product) {
    newProductData.value = { ...product };
    newProduct.value = true;
  }
};

const onRejectedFiles = (rejectedEntries: any[]) => {
  $q.notify({
    type: 'negative',
    message: `${rejectedEntries.length} file(s) were rejected`,
    caption: 'Only JPG images are accepted'
  });
};
const addProduct = () => {
  try {
    
    // Create the new product object
    const productToAdd: Product = {
      ...newProductData.value,
    };
    
    // Add to the products array
    products.value.unshift(productToAdd);
    
    // Reset form and close dialog
    resetProductForm();
    newProduct.value = false;
    
    $q.notify({
      type: 'positive',
      message: 'Product added successfully'
    });

  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error adding product'
    });
    console.error('Error adding product:', error);
  }
};

const resetProductForm = () => {
  newProductData.value = {
    id: '',
    name: '',
    sku: '',
    category: '',
    price: 0,
    stock_quantity: 0,
    status: 'draft',
    image_urls: []
  };
  newProductImages.value = [];
};

onMounted(async () => {
  try {
    loading.value = true;
    const response = await fetchProducts();
    console.log('Fetched products:', response);
    pagination.value.rowsNumber = filteredProducts.value.length;
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error fetching products'
    });
    console.error('Error fetching products:', error);
  } finally {
    loading.value = false;
  }
});
</script>