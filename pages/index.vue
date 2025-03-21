<template>
  <v-row>
    <!-- Summary Cards -->
    <v-col cols="12" md="4" v-for="(card, index) in summaryCards" :key="index">
      <v-card :color="card.color" variant="tonal" class="h-100">
        <v-card-item>
          <v-card-title class="text-h6">{{ card.title }}</v-card-title>
          <v-card-subtitle class="text-h4 pt-4">
            <div>{{ formatCurrency(card.amounts.THB, 'THB') }}</div>
            <div>{{ formatCurrency(card.amounts.LAK, 'LAK') }}</div>
          </v-card-subtitle>
        </v-card-item>
      </v-card>
    </v-col>

    <!-- Transaction Form -->
    <v-col cols="12">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon icon="mdi-plus-circle" class="mr-2" />
          เพิ่มรายการใหม่
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="addTransaction">
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="newTransaction.type"
                  :items="[
                    { title: 'รายรับ', value: 'income' },
                    { title: 'รายจ่าย', value: 'expense' }
                  ]"
                  item-title="title"
                  item-value="value"
                  label="ประเภท"
                  variant="outlined"
                  density="comfortable"
                  :color="newTransaction.type === 'income' ? 'success' : 'error'"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newTransaction.amount"
                  type="number"
                  label="จำนวนเงิน"
                  variant="outlined"
                  density="comfortable"
                  min="0"
                  step="0.01"
                  required
                  :color="newTransaction.type === 'income' ? 'success' : 'error'"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="newTransaction.currency"
                  :items="currencies"
                  item-title="title"
                  item-value="value"
                  label="สกุลเงิน"
                  variant="outlined"
                  density="comfortable"
                  :color="newTransaction.type === 'income' ? 'success' : 'error'"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="newTransaction.category"
                  :items="categories[newTransaction.type]"
                  label="หมวดหมู่"
                  variant="outlined"
                  density="comfortable"
                  :color="newTransaction.type === 'income' ? 'success' : 'error'"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newTransaction.date"
                  type="date"
                  label="วันที่"
                  variant="outlined"
                  density="comfortable"
                  required
                  :color="newTransaction.type === 'income' ? 'success' : 'error'"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="newTransaction.description"
                  label="รายละเอียด"
                  variant="outlined"
                  density="comfortable"
                  :color="newTransaction.type === 'income' ? 'success' : 'error'"
                />
              </v-col>
            </v-row>
            <v-card-actions class="justify-end">
              <v-btn
                type="submit"
                :color="newTransaction.type === 'income' ? 'success' : 'error'"
                :prepend-icon="newTransaction.type === 'income' ? 'mdi-plus' : 'mdi-minus'"
              >
                บันทึก
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Transactions List -->
    <v-col cols="12">
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon icon="mdi-format-list-bulleted" class="mr-2" />
            รายการธุรกรรม
          </div>
          <v-btn
            color="error"
            variant="tonal"
            prepend-icon="mdi-delete-sweep"
            @click="confirmClearAll"
          >
            ลบทั้งหมด
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-data-table
            :headers="headers"
            :items="transactions"
            :sort-by="[{ key: 'date', order: 'desc' }]"
            hover
          >
            <template v-slot:item.type="{ item }">
              <v-chip
                :color="item.type === 'income' ? 'success' : 'error'"
                size="small"
                variant="tonal"
              >
                {{ item.type === 'income' ? 'รายรับ' : 'รายจ่าย' }}
              </v-chip>
            </template>
            <template v-slot:item.amount="{ item }">
              <span :class="item.type === 'income' ? 'text-success' : 'text-error'">
                {{ formatCurrency(item.amount, item.currency) }}
              </span>
            </template>
            <template v-slot:item.date="{ item }">
              {{ formatDate(item.date) }}
            </template>
            <template v-slot:item.actions="{ item }">
              <v-btn
                icon
                size="small"
                color="primary"
                class="me-2"
                @click="editTransaction(item)"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn
                icon
                size="small"
                color="error"
                @click="confirmDelete(item)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <!-- Edit Dialog -->
  <v-dialog v-model="editDialog" max-width="600px">
    <v-card v-if="editingTransaction">
      <v-card-title class="d-flex align-center">
        <v-icon icon="mdi-pencil" class="mr-2" />
        แก้ไขรายการ
      </v-card-title>
      <v-card-text>
        <v-form @submit.prevent="saveEdit">
          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="editingTransaction.type"
                :items="[
                  { title: 'รายรับ', value: 'income' },
                  { title: 'รายจ่าย', value: 'expense' }
                ]"
                item-title="title"
                item-value="value"
                label="ประเภท"
                variant="outlined"
                density="comfortable"
                :color="editingTransaction.type === 'income' ? 'success' : 'error'"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="editingTransaction.amount"
                type="number"
                label="จำนวนเงิน"
                variant="outlined"
                density="comfortable"
                min="0"
                step="0.01"
                required
                :color="editingTransaction.type === 'income' ? 'success' : 'error'"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="editingTransaction.currency"
                :items="currencies"
                item-title="title"
                item-value="value"
                label="สกุลเงิน"
                variant="outlined"
                density="comfortable"
                :color="editingTransaction.type === 'income' ? 'success' : 'error'"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="editingTransaction.category"
                :items="categories[editingTransaction.type]"
                label="หมวดหมู่"
                variant="outlined"
                density="comfortable"
                :color="editingTransaction.type === 'income' ? 'success' : 'error'"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="editingTransaction.date"
                type="date"
                label="วันที่"
                variant="outlined"
                density="comfortable"
                required
                :color="editingTransaction.type === 'income' ? 'success' : 'error'"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="editingTransaction.description"
                label="รายละเอียด"
                variant="outlined"
                density="comfortable"
                :color="editingTransaction.type === 'income' ? 'success' : 'error'"
              />
            </v-col>
          </v-row>
          <v-card-actions class="justify-end">
            <v-btn
              color="grey"
              variant="text"
              class="me-2"
              @click="editDialog = false"
            >
              ยกเลิก
            </v-btn>
            <v-btn
              type="submit"
              :color="editingTransaction.type === 'income' ? 'success' : 'error'"
            >
              บันทึก
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Delete Confirmation Dialog -->
  <v-dialog v-model="deleteDialog" max-width="400">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon icon="mdi-alert" color="error" class="mr-2" />
        ยืนยันการลบ
      </v-card-title>
      <v-card-text>
        คุณแน่ใจหรือไม่ที่จะลบรายการนี้?
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn
          color="grey"
          variant="text"
          class="me-2"
          @click="deleteDialog = false"
        >
          ยกเลิก
        </v-btn>
        <v-btn
          color="error"
          @click="deleteTransaction"
        >
          ลบ
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Clear All Confirmation Dialog -->
  <v-dialog v-model="clearAllDialog" max-width="400">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon icon="mdi-alert" color="error" class="mr-2" />
        ยืนยันการลบทั้งหมด
      </v-card-title>
      <v-card-text>
        คุณแน่ใจหรือไม่ที่จะลบรายการทั้งหมด? การกระทำนี้ไม่สามารถย้อนกลับได้
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn
          color="grey"
          variant="text"
          class="me-2"
          @click="clearAllDialog = false"
        >
          ยกเลิก
        </v-btn>
        <v-btn
          color="error"
          @click="clearAllTransactions"
        >
          ลบทั้งหมด
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  currency: 'THB' | 'LAK';
}

const currencies = [
  { title: 'Thai Baht (฿)', value: 'THB' },
  { title: 'Lao Kip (₭)', value: 'LAK' }
]

const categories = {
  income: [
    'เงินเดือน',
    'amphetamine low',
    'amphetamine medium',
    'amphetamine high',
    'รายได้เสริม',
    'อื่นๆ'
  ],
  expense: [
    'อาหาร',
    'ที่พัก',
    'ความบันเทิง',
    'การศึกษา',
    'คืนค่า amphetamine',
    'อื่นๆ'
  ]
}

const transactions = ref<Transaction[]>([])

// Load transactions from localStorage on component mount
onMounted(() => {
  const savedTransactions = localStorage.getItem('transactions')
  if (savedTransactions) {
    transactions.value = JSON.parse(savedTransactions)
  }
})

// Save transactions to localStorage whenever they change
watch(transactions, (newTransactions) => {
  localStorage.setItem('transactions', JSON.stringify(newTransactions))
}, { deep: true })

const newTransaction = ref({
  type: 'income' as const,
  amount: '',
  category: categories.income[0],
  description: '',
  date: new Date().toISOString().split('T')[0],
  currency: 'THB' as 'THB' | 'LAK'
})

const totalIncome = computed(() => {
  const thbTotal = transactions.value
    .filter(t => t.type === 'income' && t.currency === 'THB')
    .reduce((sum, t) => sum + Number(t.amount), 0)
  
  const lakTotal = transactions.value
    .filter(t => t.type === 'income' && t.currency === 'LAK')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  return { THB: thbTotal, LAK: lakTotal }
})

const totalExpenses = computed(() => {
  const thbTotal = transactions.value
    .filter(t => t.type === 'expense' && t.currency === 'THB')
    .reduce((sum, t) => sum + Number(t.amount), 0)
  
  const lakTotal = transactions.value
    .filter(t => t.type === 'expense' && t.currency === 'LAK')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  return { THB: thbTotal, LAK: lakTotal }
})

const totalBalance = computed(() => ({
  THB: totalIncome.value.THB - totalExpenses.value.THB,
  LAK: totalIncome.value.LAK - totalExpenses.value.LAK
}))

const summaryCards = computed(() => [
  {
    title: 'ยอดคงเหลือ',
    amounts: {
      THB: totalBalance.value.THB,
      LAK: totalBalance.value.LAK
    },
    color: totalBalance.value.THB >= 0 && totalBalance.value.LAK >= 0 ? 'success' : 'error'
  },
  {
    title: 'รายรับทั้งหมด',
    amounts: {
      THB: totalIncome.value.THB,
      LAK: totalIncome.value.LAK
    },
    color: 'success'
  },
  {
    title: 'รายจ่ายทั้งหมด',
    amounts: {
      THB: totalExpenses.value.THB,
      LAK: totalExpenses.value.LAK
    },
    color: 'error'
  }
])

const headers = [
  { title: 'วันที่', key: 'date', align: 'start' as const },
  { title: 'ประเภท', key: 'type', align: 'start' as const },
  { title: 'หมวดหมู่', key: 'category', align: 'start' as const },
  { title: 'รายละเอียด', key: 'description', align: 'start' as const },
  { title: 'จำนวนเงิน', key: 'amount', align: 'end' as const },
  { title: 'สกุลเงิน', key: 'currency', align: 'start' as const },
  { title: 'จัดการ', key: 'actions', align: 'center' as const, sortable: false }
]

// Add new refs for edit and delete functionality
const editDialog = ref(false)
const deleteDialog = ref(false)
const editingTransaction = ref<Transaction | null>(null)
const transactionToDelete = ref<Transaction | null>(null)

// Add new ref for clear all dialog
const clearAllDialog = ref(false)

function formatCurrency(amount: number, currency: 'THB' | 'LAK'): string {
  try {
    if (currency === 'THB') {
      return new Intl.NumberFormat('th-TH', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount) + ' ฿';
    } else {
      return new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount) + ' ₭';
    }
  } catch (error) {
    console.error('Currency formatting error:', error);
    return `${amount} ${currency}`;
  }
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function addTransaction() {
  const currentDate = new Date().toISOString().split('T')[0];
  transactions.value.unshift({
    id: Date.now().toString(),
    ...newTransaction.value,
    date: newTransaction.value.date || currentDate,
    amount: Number(newTransaction.value.amount)
  })
  
  // Reset form
  newTransaction.value = {
    type: 'income',
    amount: '',
    category: categories.income[0],
    description: '',
    date: currentDate,
    currency: 'THB'
  }
}

// Watch for type changes to update category
watch(() => newTransaction.value.type, (newType) => {
  newTransaction.value.category = categories[newType][0]
})

function editTransaction(item: Transaction) {
  editingTransaction.value = {
    id: item.id,
    type: item.type,
    amount: item.amount,
    category: item.category,
    description: item.description,
    date: item.date,
    currency: item.currency
  }
  editDialog.value = true
}

function saveEdit() {
  if (!editingTransaction.value) return
  
  const index = transactions.value.findIndex(t => t.id === editingTransaction.value?.id)
  if (index !== -1) {
    transactions.value[index] = { ...editingTransaction.value }
    editDialog.value = false
  }
}

function confirmDelete(item: Transaction) {
  transactionToDelete.value = item
  deleteDialog.value = true
}

function deleteTransaction() {
  if (!transactionToDelete.value) return
  
  const index = transactions.value.findIndex(t => t.id === transactionToDelete.value?.id)
  if (index !== -1) {
    transactions.value.splice(index, 1)
    deleteDialog.value = false
  }
}

function confirmClearAll() {
  clearAllDialog.value = true
}

function clearAllTransactions() {
  transactions.value = []
  clearAllDialog.value = false
}
</script>

<style>
.v-card-subtitle {
  opacity: 1 !important;
}
</style> 