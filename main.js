import * as axios from 'lib/axios.min.js'
import * as ui from 'lib/ui.js'

const _verificationResults = async (filter_obj) => {
	try {
		const url = urlLib.getUrl('https://fgis.gost.ru/fundmetrology/cm/icdb/vri/select', filter_obj)
		const res = await axios.get(url)
		return res.data.response
	} catch (err) {
		console.log('fgis_api.js error!!!')
	}
}

const _getVal = (id) => {
    return document.getElementById(id).value
}

const _getFilter = () => {

}

document.getElementById('btn_search').addEventListener('click', () => {
	const filter_obj = {
		fq: {
			verification_year: _getVal('year'),
			org_title: encodeURI(`*${_getVal('organisation')}*`),
			'mi.number': `*${_getVal('serial_number')}*`,
			'mi.mitnumber': `*${_getVal('registry_number')}*`,
			'mi.mitype': `*${_getVal('mi_type')}`
		},
		q: '*',
		fl: 'vri_id,mi.mitnumber,mi.mitype,mi.modification,mi.number,verification_date,valid_date,result_docnum',
		sort: 'verification_date+desc,org_title+asc',
		rows: 10,
		start: 0,
	}
    const data = await _verificationResults(filter_obj)

	console.log(data)
}
