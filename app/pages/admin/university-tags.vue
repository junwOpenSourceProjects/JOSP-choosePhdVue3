<script setup lang="ts">
import type { UniversityDetail, UniversityTag } from '~/types'

useHead({ title: '标签管理' })

const $api = useApi()

interface TagForm {
  slug: string
  nameZh: string
  nameEn: string
  category: string
  color: string
  description: string
  sortOrder: number
  active: number
}

const emptyForm = (): TagForm => ({
  slug: '',
  nameZh: '',
  nameEn: '',
  category: 'other',
  color: '',
  description: '',
  sortOrder: 0,
  active: 1
})

const tags = ref<UniversityTag[]>([])
const loading = ref(false)
const saving = ref(false)
const editingId = ref<number | null>(null)
const form = ref<TagForm>(emptyForm())
const error = ref('')

const assignUrlId = ref('')
const assignTagIds = ref<number[]>([])
const assigning = ref(false)
const assignMessage = ref('')

// 删除二次确认弹窗状态 — UModal 替代浏览器原生 confirm()
// 不暴露的 info 解耦删除流程 (跟 JOSP-* 通用二次确认弹窗模式对齐)
const deleteConfirmOpen = ref(false)
const deleteTarget = ref<UniversityTag | null>(null)
const deleting = ref(false)

const fetchTags = async () => {
  loading.value = true
  try {
    tags.value = await $api<UniversityTag[]>('/api/v1/admin/university-tags')
  } catch (e: any) {
    error.value = e?.message || '获取标签失败'
  } finally {
    loading.value = false
  }
}

const startCreate = () => {
  editingId.value = null
  form.value = emptyForm()
  error.value = ''
}

const startEdit = (tag: UniversityTag) => {
  editingId.value = tag.id
  form.value = {
    slug: tag.slug,
    nameZh: tag.nameZh,
    nameEn: tag.nameEn || '',
    category: tag.category || 'other',
    color: tag.color || '',
    description: tag.description || '',
    sortOrder: tag.sortOrder || 0,
    active: 1
  }
  error.value = ''
}

const cancelEdit = () => {
  editingId.value = null
  form.value = emptyForm()
  error.value = ''
}

const saveTag = async () => {
  if (!form.value.slug.trim() || !form.value.nameZh.trim()) {
    error.value = '标识和中文名称不能为空'
    return
  }
  saving.value = true
  error.value = ''
  try {
    if (editingId.value == null) {
      await $api('/api/v1/admin/university-tags', {
        method: 'POST',
        body: form.value
      })
    } else {
      await $api(`/api/v1/admin/university-tags/${editingId.value}`, {
        method: 'PUT',
        body: form.value
      })
    }
    form.value = emptyForm()
    editingId.value = null
    await fetchTags()
  } catch (e: any) {
    error.value = e?.message || '保存失败'
  } finally {
    saving.value = false
  }
}

const deleteTag = async (tag: UniversityTag) => {
  deleteTarget.value = tag
  deleteConfirmOpen.value = true
}

const confirmDelete = async () => {
  const tag = deleteTarget.value
  if (!tag) return
  deleting.value = true
  try {
    await $api(`/api/v1/admin/university-tags/${tag.id}`, { method: 'DELETE' })
    deleteConfirmOpen.value = false
    deleteTarget.value = null
    await fetchTags()
  } catch (e: any) {
    error.value = e?.message || '删除失败'
  } finally {
    deleting.value = false
  }
}

const loadUniversityTags = async () => {
  if (!assignUrlId.value.trim()) return
  assignMessage.value = ''
  try {
    const res = await $api<UniversityDetail>(`/api/v1/universities/${encodeURIComponent(assignUrlId.value.trim())}`)
    assignTagIds.value = res.tags?.map(t => t.id) || []
  } catch (e: any) {
    assignMessage.value = e?.message || '加载院校标签失败'
  }
}

const saveUniversityTags = async () => {
  if (!assignUrlId.value.trim()) {
    assignMessage.value = '请输入院校 urlId'
    return
  }
  assigning.value = true
  assignMessage.value = ''
  try {
    await $api(`/api/v1/admin/university-tags/universities/${encodeURIComponent(assignUrlId.value.trim())}`, {
      method: 'PUT',
      body: assignTagIds.value
    })
    assignMessage.value = '保存成功'
  } catch (e: any) {
    assignMessage.value = e?.message || '保存失败'
  } finally {
    assigning.value = false
  }
}

onMounted(fetchTags)

const categoryLabel = (category?: string) => {
  const map: Record<string, string> = {
    domestic: '国内',
    foreign: '国外',
    other: '其他'
  }
  return map[category || 'other'] || category
}
</script>

<template>
  <div class="container-page py-[var(--spacing-section)]">
    <h1 class="heading-lg text-[var(--color-ink)] mb-[var(--spacing-md)]">院校标签管理</h1>
    <p class="subtitle text-[var(--color-steel)] mb-[var(--spacing-xl)]">
      管理院校标签、颜色、排序，以及为单个院校设置标签。
    </p>

    <AppCard variant="feature" class="mb-[var(--spacing-xl)]">
      <h2 class="heading-sm text-[var(--color-ink)] mb-[var(--spacing-md)]">
        {{ editingId == null ? '新建标签' : '编辑标签' }}
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[var(--spacing-md)] mb-[var(--spacing-md)]">
        <div>
          <label class="body-sm-medium text-[var(--color-charcoal)] block mb-[var(--spacing-xs)]">标识 slug</label>
          <input v-model="form.slug" class="text-input" placeholder="例如 985">
        </div>
        <div>
          <label class="body-sm-medium text-[var(--color-charcoal)] block mb-[var(--spacing-xs)]">中文名称</label>
          <input v-model="form.nameZh" class="text-input" placeholder="例如 985">
        </div>
        <div>
          <label class="body-sm-medium text-[var(--color-charcoal)] block mb-[var(--spacing-xs)]">英文名称</label>
          <input v-model="form.nameEn" class="text-input" placeholder="Project 985">
        </div>
        <div>
          <label class="body-sm-medium text-[var(--color-charcoal)] block mb-[var(--spacing-xs)]">分类</label>
          <select v-model="form.category" class="text-input">
            <option value="domestic">国内</option>
            <option value="foreign">国外</option>
            <option value="other">其他</option>
          </select>
        </div>
        <div>
          <label class="body-sm-medium text-[var(--color-charcoal)] block mb-[var(--spacing-xs)]">颜色</label>
          <div class="flex gap-2">
            <input v-model="form.color" class="text-input flex-1" placeholder="#C8102E">
            <input v-model="form.color" type="color" class="h-10 w-10 p-0 border-0 rounded-[var(--rounded-md)] cursor-pointer">
          </div>
        </div>
        <div class="sm:col-span-2 lg:col-span-4">
          <label class="body-sm-medium text-[var(--color-charcoal)] block mb-[var(--spacing-xs)]">简介</label>
          <textarea v-model="form.description" rows="3" class="text-input h-auto py-[var(--spacing-md)]" placeholder="标签的简短介绍，用于前端展示"></textarea>
        </div>
        <div>
          <label class="body-sm-medium text-[var(--color-charcoal)] block mb-[var(--spacing-xs)]">排序</label>
          <input v-model.number="form.sortOrder" type="number" class="text-input" placeholder="0">
        </div>
        <div>
          <label class="body-sm-medium text-[var(--color-charcoal)] block mb-[var(--spacing-xs)]">状态</label>
          <select v-model.number="form.active" class="text-input">
            <option :value="1">启用</option>
            <option :value="0">禁用</option>
          </select>
        </div>
      </div>
      <p v-if="error" class="body-sm text-[var(--color-error)] mb-[var(--spacing-md)]">{{ error }}</p>
      <div class="flex gap-[var(--spacing-md)]">
        <AppButton variant="primary" :disabled="saving" @click="saveTag">
          {{ saving ? '保存中…' : '保存' }}
        </AppButton>
        <AppButton v-if="editingId != null" variant="tertiary" @click="cancelEdit">
          取消
        </AppButton>
      </div>
    </AppCard>

    <ClientOnly>
      <AppCard class="mb-[var(--spacing-xl)]">
        <h2 class="heading-sm text-[var(--color-ink)] mb-[var(--spacing-md)]">为院校设置标签</h2>
      <div class="flex flex-col sm:flex-row gap-[var(--spacing-md)] mb-[var(--spacing-md)]">
        <input
          v-model="assignUrlId"
          class="text-input sm:w-80"
          placeholder="输入院校 urlId，例如 tsinghua-university"
          @blur="loadUniversityTags"
        >
        <AppButton variant="secondary" :disabled="!assignUrlId.trim()" @click="loadUniversityTags">
          加载现有标签
        </AppButton>
      </div>
      <div v-if="tags.length" class="flex flex-wrap gap-[var(--spacing-xs)] mb-[var(--spacing-md)]">
        <label
          v-for="tag in tags"
          :key="tag.id"
          class="inline-flex items-center gap-[var(--spacing-xs)] px-[var(--spacing-md)] py-[var(--spacing-xs)] rounded-[var(--rounded-full)] border cursor-pointer transition-colors"
          :class="assignTagIds.includes(tag.id)
            ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] border-[var(--color-primary)]'
            : 'bg-[var(--color-canvas)] text-[var(--color-steel)] border-[var(--color-hairline)]'"
        >
          <input
            v-model="assignTagIds"
            type="checkbox"
            :value="tag.id"
            class="sr-only"
          >
          <span class="body-sm-medium">{{ tag.nameZh }}</span>
        </label>
      </div>
      <p v-if="assignMessage" class="body-sm mb-[var(--spacing-md)]" :class="assignMessage.includes('成功') ? 'text-[var(--color-success-text)]' : 'text-[var(--color-error)]'">
        {{ assignMessage }}
      </p>
      <AppButton variant="primary" :disabled="assigning || !assignUrlId.trim()" @click="saveUniversityTags">
        {{ assigning ? '保存中…' : '保存院校标签' }}
      </AppButton>
    </AppCard>

    <AppCard>
      <h2 class="heading-sm text-[var(--color-ink)] mb-[var(--spacing-md)]">标签列表</h2>
      <AppDataTable
        :columns="[
          { key: 'id', label: 'ID' },
          { key: 'slug', label: '标识' },
          { key: 'nameZh', label: '中文名称' },
          { key: 'category', label: '分类' },
          { key: 'color', label: '颜色' },
          { key: 'sortOrder', label: '排序' },
          { key: 'active', label: '状态' },
          { key: 'actions', label: '操作' }
        ]"
        :rows="tags"
        :loading="loading"
      >
        <template #category="{ row }">
          {{ categoryLabel(row.category) }}
        </template>
        <template #color="{ row }">
          <span v-if="row.color" class="inline-flex items-center gap-1">
            <span class="inline-block w-4 h-4 rounded-full border border-[var(--color-hairline)]" :style="{ backgroundColor: row.color }" />
            <span class="body-sm text-[var(--color-steel)]">{{ row.color }}</span>
          </span>
          <span v-else class="text-[var(--color-steel)]">—</span>
        </template>
        <template #active="{ row }">
          <AppBadge
            :variant="row.active === 1 ? 'success' : 'new'"
            :label="row.active === 1 ? '启用' : '禁用'"
          />
        </template>
        <template #actions="{ row }">
          <div class="flex gap-[var(--spacing-md)]">
            <AppButton variant="link" @click="startEdit(row)">编辑</AppButton>
            <AppButton variant="link" @click="deleteTag(row)">删除</AppButton>
          </div>
        </template>
      </AppDataTable>
    </AppCard>

    <!-- 删除二次确认 — UModal 替代 confirm() -->
    <UModal v-model:open="deleteConfirmOpen" :title="`删除标签「${deleteTarget?.nameZh ?? ''}」`">
      <template #body>
        <p class="body-md text-[var(--color-charcoal)]">
          关联关系（院校-标签映射）也会被清除，且不可恢复。确认删除吗？
        </p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-[var(--spacing-md)]">
          <AppButton variant="tertiary" :disabled="deleting" @click="deleteConfirmOpen = false">取消</AppButton>
          <AppButton variant="primary" :disabled="deleting" @click="confirmDelete">
            {{ deleting ? '删除中…' : '确认删除' }}
          </AppButton>
        </div>
      </template>
    </UModal>
    </ClientOnly>
  </div>
</template>
