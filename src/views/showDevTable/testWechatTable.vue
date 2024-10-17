<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.goods"
        :placeholder="'商品名称'"
        style="width: 200px;"
        class="filter-item"
        clearable
        @keyup.enter.native="handleFilter"
      />
      <el-select
        v-model="listQuery.retype"
        :placeholder="'收支类型'"
        clearable
        style="width: 90px"
        class="filter-item"
      >
        <el-option v-for="item in this.retypeOptions" :key="item" :label="item" :value="item" />
      </el-select>
      <!-- todo 日期范围 -->
      <el-select
        v-model="listQuery.payment"
        :placeholder="'付款账号'"
        clearable
        class="filter-item"
        style="width: 130px"
      >
        <el-option
          v-for="item in paymentTypeOptions"
          :key="item.key"
          :label="item.display_name + '(' + item.key + ')'"
          :value="item.key"
        />
      </el-select>
      <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select>
      <!-- <div class="filter-item">
        <el-date-picker
          v-model="listQuery.value2"
          type="daterange"
          align="right"
          unlink-panels
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="pickerOptions"
        />
      </div> -->
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        {{ '搜索' }}
      </el-button>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        <!--todo 没有设置清空表单的方法-->
        {{ '重置条件' }}
      </el-button>
      <el-button
        v-waves
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleDownload"
      >
        {{ '导出' }}
      </el-button>
      <el-checkbox v-model="showReviewer" class="filter-item" style="margin-left:15px;" @change="tableKey = tableKey + 1">
        {{ '更多信息' }}
      </el-checkbox>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column
        type="index"
        label="序号"
        width="50px"
        sortable
        align="center"
      />
      <el-table-column
        prop="billTime"
        label="交易时间"
        width="160px"
        sortable
        align="center"
      /><el-table-column
        prop="goods"
        label="商品说明"
        sortable
        align="center"
      />
      <el-table-column
        prop="price"
        label="金额"
        width="80px"
        sortable
        align="center"
      />
      <el-table-column
        prop="billObject"
        label="交易对方"
        width="250px"
        sortable
        align="center"
      />
      <el-table-column
        prop="billType"
        label="分类"
        width="80px"
        sortable
        align="center"
      /><el-table-column
        prop="payment"
        label="收/付款方式"
        width="200px"
        sortable
        align="center"
      />
      <el-table-column
        prop="retype"
        :filter-method="filterTag"
        :filters="[{ text: '收入', value: '收入' }, { text: '支出', value: '支出' }, { text: '不计收支', value: '不计收支' }]"
        filter-placement="bottom-end"
        label="标签"
        width="100"
      >
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.retype === '收入' ? 'success' : (scope.row.retype === '支出'?'danger':'primary')"
            disable-transitions
          >{{ scope.row.retype }}
          </el-tag>
        </template>
      </el-table-column>
      <!--==========================================================================-->
      <el-table-column v-if="showReviewer" :label="$t('table.reviewer')" width="120px" align="center">
        <template slot-scope="{row}">
          <span style="color:red;">{{ row.reviewer }}</span>
          <!-- <span>{{ row.objectAcc }}</span> -->
        </template>
      </el-table-column>
      <!-- <el-table-column v-if="showReviewer" label="对方账号" width="120px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.objectAcc }}</span>
        </template>
      </el-table-column> -->
      <el-table-column v-if="showReviewer" label="订单号" width="120px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.orderNum }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="showReviewer" label="商家订单号" width="120px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.merchantOrderNumber }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="showReviewer" label="备注" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.remark }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.actions')" align="center" width="160px" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button v-if="row.status != 'deleted'" size="mini" type="default" @click="handleDelete(row, $index)">
            {{ '隐藏' }}
          </el-button>
          <el-button v-if="row.status != 'deleted'" size="mini" type="danger" @click="handleDelete(row, $index)">
            {{ '删除' }}
          </el-button>
        </template>
      </el-table-column>

    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">{{ $t('table.confirm') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { fetchWeChatDatabaseList } from '@/api/devDataQuery'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import dayjs from 'dayjs'

const paymentTypeOptions = [
  { key: '0360', display_name: '中信银行信用卡(0360)' },
  { key: '7771', display_name: '中国农业银行储蓄卡(7771)' },
  { key: '3733', display_name: '中国工商银行信用卡(3733)' },
  { key: '8320', display_name: '中国工商银行储蓄卡(8320)' },
  { key: '9835', display_name: '中国建设银行信用卡(9835)' },
  { key: '9829', display_name: '中国银行储蓄卡(9829)' },
  { key: '5365', display_name: '兴业银行信用卡(5365)' },
  { key: '4596', display_name: '广发银行信用卡(4596)' },
  { key: '5186', display_name: '广发银行储蓄卡(5186)' },
  { key: '1490', display_name: '招商银行信用卡(1490)' },
  { key: '2406', display_name: '招商银行储蓄卡(2406)' },
  { key: '3847', display_name: '招商银行储蓄卡(3847)' },
  { key: '支付宝余额', display_name: '余额宝' },
  { key: '暂无账号', display_name: '微信余额' },
  { key: '红包', display_name: '支付宝余额' },
  { key: '花呗', display_name: '暂无账号' },
  { key: '余额宝', display_name: '余额宝' },
  { key: '微信余额', display_name: '微信余额' }
]

// arr to obj, such as { CN : "China", US : "USA" }
const paymentTypeKeyValue = paymentTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

const formatDate = date => {
  return dayjs(date).format('YYYY-MM-DDTHH:mm:ss.SSSZ')
}
export default {
  name: 'WechatTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return paymentTypeKeyValue[type]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        goods: '',
        retype: '',
        payment: '',
        sort: ''
        // startDate: '',
        // endDate: ''
      },
      // value2: [],
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
            // this.listQuery.startDate = start
            // this.listQuery.endDate = end
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
            // this.listQuery.startDate = start
            // this.listQuery.endDate = end
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
            // this.listQuery.startDate = start
            // this.listQuery.endDate = end
            // 向value2数组中添加start，代码如下：
            // this.value2.push(start, end)
          }
        }]
      },

      retypeOptions: ['支出', '收入', '不计收支'],
      paymentTypeOptions,
      sortOptions: [{ label: '日期降序', key: '+date' }, { label: '日期升序', key: '-date' }],
      showReviewer: false,
      dialogPvVisible: false,
      pvData: [],
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      console.log('我是list' + JSON.stringify(this.listQuery))
      if (this.value2 != null) {
        const startDate = formatDate(this.listQuery.value2[0])
        const endDate = formatDate(this.listQuery.value2[1])
        // console.log(this.listQuery.value2[0])
        // console.log(this.listQuery.value2[1])
        // 重要!赋值给请求参数
        this.listQuery.startDate = startDate
        this.listQuery.endDate = endDate
      } else {
        this.listQuery.startDate = ''
        this.listQuery.endDate = ''
      }
      delete this.listQuery.value2
      console.log('我是value2' + this.value2)
      fetchWeChatDatabaseList(this.listQuery).then(response => {
        this.list = response.data.records
        this.total = response.data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    filterTag(value, row) {
      return row.tag === value
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    handleDelete(row, index) {
      this.$notify({
        title: '成功',
        message: '删除成功',
        type: 'success',
        duration: 2000
      })
      this.list.splice(index, 1)
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['timestamp', 'goods', 'payment', 'retype', 'status']
        const filterVal = ['timestamp', 'goods', 'payment', 'retype', 'status']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
