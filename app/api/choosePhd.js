import request from '~/utils/request'

export const insertChoosePhd = (data) => request.post('/insertChoosePhd/insert', data)
