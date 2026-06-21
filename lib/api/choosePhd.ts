import request from '~/lib/request'
import type { ShowResult } from '~/types'

export const insertChoosePhd = () => request.post<ShowResult<unknown>>('/insertChoosePhd/insert')
