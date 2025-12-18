import { NextApiRequest, NextApiResponse } from 'next'
import { programService } from '@/services/programService'
import { EquipmentData } from '@/types/program'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid program ID' })
  }

  const programId = parseInt(id)

  if (isNaN(programId)) {
    return res.status(400).json({ error: 'Invalid program ID format' })
  }

  try {
    if (req.method === 'GET') {
      // Get equipment data for a specific program
      const data = await programService.getEquipmentData(programId)
      return res.status(200).json(data)
    } else if (req.method === 'PUT') {
      // Update equipment data for a specific program
      const updatedData: EquipmentData = req.body
      const success = await programService.updateEquipmentData(updatedData)
      
      if (success) {
        return res.status(200).json({ message: 'Equipment data updated successfully' })
      } else {
        return res.status(500).json({ error: 'Failed to update equipment data' })
      }
    } else {
      res.setHeader('Allow', ['GET', 'PUT'])
      return res.status(405).json({ error: `Method ${req.method} not allowed` })
    }
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}