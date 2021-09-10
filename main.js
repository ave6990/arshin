import * as ui from './lib/ui.js'
import * as urlLib from './lib/url.js'
import * as date from './lib/date.js'

const config = {
    records_count: 0,
    rows_count: 20,
    page_num: 0,
}

document.getElementById('btn_next').addEventListener('click', async () => {
    if (config.rows_count < config.records_count && (config.page_num + 1) * config.rows_count < config.records_count) {
        config.page_num += 1
        getRecords()
    }
} )

document.getElementById('btn_prev').addEventListener('click', async () => {
    if (config.rows_count < config.records_count && config.page_num > 0) {
        config.page_num -= 1
        getRecords()
    }
} )


const _verificationResults = async (filter_obj) => {
	try {
		const url = urlLib.getUrl('https://fgis.gost.ru/fundmetrology/cm/xcdb/vri/select', filter_obj)
        console.log(url)
        const response = await fetch(url)
        const data = response.json()

		return data
	} catch (err) {
		console.log('fgis_api.js error!!!', err)
	}
}

const _getVal = (id) => {
    return document.getElementById(id).value
}

const _getFilter = () => {
    const query = {}

    const fields = {
        'verification_year': 'year',
        'org_title': 'organisation',
        'mi.number': 'serial_number',
        'mi.mitnumber': 'registry_number',
        'mi.modification': 'mi_modification',
        'verification_date': 'verification_date',
    }

    for (let field in fields) {
        let val = _getVal(fields[field])

        if (val) {
            if (field != 'verification_year') {
                if (field == 'verification_date') {
                    const valid_date = _getVal('valid_date')
                    if (valid_date) {
                        valid_date = `${valid_date}T00:00:00Z`
                    } else {
                        valid_date = '*'
                    }
                    val = `[${val}T00:00:00Z TO ${valid_date}]`
                } else {
                    val = `*${val}*`
                }
            }
            query[field] = val
        }
    }

    return query
}

const getRecords = async () => {
    const query = _getFilter()

	const filter_obj = {
		q: '*',
		fl: 'vri_id,mi.mitnumber,mi.mitype,mi.modification,mi.number,verification_date,valid_date,result_docnum',
		sort: 'verification_date+desc,org_title+asc',
		rows: config.rows_count,
		start: config.page_num * config.rows_count,
	}

    filter_obj.fq = query

    //const data = await _verificationResults(Object.assign({}, query, filter_obj))
    const data = await _verificationResults(filter_obj)
    config.records_count = data.response.numFound
    document.getElementById('counts').innerHTML = config.records_count

    const docs = data.response.docs.map((doc) => {
        doc.vri_id = `<a href="https://fgis.gost.ru/fundmetrology/cm/results/${doc.vri_id}">${doc.vri_id}</a>`
        doc.verification_date = date.toString(new Date(doc.verification_date))
        doc.valid_date = date.toString(new Date(doc.valid_date))
    })

    const table = ui.jsonToTable(data.response.docs, {
            'vri_id': 'Номер в Аршине',
            'mi.mitnumber': 'Рег. номер',
            'mi.mitype': 'Тип СИ',
            'mi.modification': 'Модификация СИ',
            'mi.number': 'Зав. номер СИ',
            'verification_date': 'Дата поверки',
            'valid_date': 'Годен до',
            'result_docnum': 'Номер документа',
        },
        'records_table')
    document.getElementById('table_results').innerHTML = table
    document.getElementById('page_num').value = `${config.page_num + 1} из ${parseInt(config.records_count / config.rows_count) + 1}`
}

document.getElementById('btn_search').addEventListener('click', getRecords)

document.getElementById('page_num').addEventListener('change', async () => {
    let num = 1

    try {
        num = parseInt(document.getElementById('page_num').value.split(' ')[0])
    }
    catch (e) {
        num = 1
        console.log(e)
    }

    let pages = parseInt(config.records_count / config.rows_count) + 1

    if (num < 1) num = 1
    if (num > pages) num = pages
    
    config.page_num = num - 1
    console.log(config.page_num)
    getRecords()
} )
