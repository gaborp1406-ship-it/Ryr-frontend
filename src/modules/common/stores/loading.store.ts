import { readonly, ref } from 'vue'

const _loading = ref<boolean>(false)

export function useLoading() {
  function show() {
    _loading.value = true
  }
  function hide() {
    _loading.value = false
  }
  return {
    loading: readonly(_loading),
    show,
    hide,
  }
}