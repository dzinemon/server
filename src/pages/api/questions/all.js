// import db
import db from '../../../db'
import { pagination as paginationConfig } from '../../../../utils/config'

// http://localhost:3000/api/questions

const getAllQa = async (req, res) => {
  try {
    const { page = 1, pageSize = paginationConfig.defaultPageSize, search = '' } = req.query
    
    // Validate pagination parameters
    const currentPage = Math.max(1, parseInt(page))
    const limit = Math.min(parseInt(pageSize), paginationConfig.maxPageSize)
    const offset = (currentPage - 1) * limit
    
    // Build the query with optional search
    let countQuery = 'SELECT COUNT(*) FROM qas'
    let dataQuery = 'SELECT id, question FROM qas'
    let queryParams = []
    let countParams = []
    
    if (search) {
      const searchCondition = ' WHERE question ILIKE $1'
      countQuery += searchCondition
      dataQuery += searchCondition
      const searchParam = `%${search}%`
      queryParams.push(searchParam)
      countParams.push(searchParam)
    }
    
    // Add ordering and pagination to data query
    dataQuery += ' ORDER BY id DESC LIMIT $' + (queryParams.length + 1) + ' OFFSET $' + (queryParams.length + 2)
    queryParams.push(limit, offset)
    
    // Get total count
    const countResult = await db.query(countQuery, countParams)
    const totalItems = parseInt(countResult.rows[0].count)
    const totalPages = Math.ceil(totalItems / limit)
    
    // Get paginated data
    const dataResult = await db.query(dataQuery, queryParams)
    
    return res.status(200).json({
      data: dataResult.rows,
      pagination: {
        currentPage,
        pageSize: limit,
        totalItems,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      }
    })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return res.status(500).json({ error: 'Failed to fetch questions' })
  }
}

const delArrayOfIds = async (req, res) => {
  try {
    const { ids } = req.body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Invalid or missing ids array' })
    }

    const result = await db.query('DELETE FROM qas WHERE id = ANY($1)', [ids])
    res
      .status(200)
      .json({
        message: 'Questions deleted successfully',
        count: result.rowCount,
      })
  } catch (error) {
    console.error('Error deleting questions:', error)
    res.status(500).json({ error: 'Failed to delete questions' })
  }
}

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      await getAllQa(req, res)
      break
    case 'DELETE':
      // delete questions by id
      await delArrayOfIds(req, res)
      break
    default:
      res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
