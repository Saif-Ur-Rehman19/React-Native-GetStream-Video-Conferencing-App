import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { copySlug, formatSlug } from '@/lib/slug'

const RoomId = ({slug}: {slug: string | null}) => {
  return (
    <TouchableOpacity onPress={() => copySlug(slug)}
    style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        padding: 10,
        borderRadius: 5
    }}
    >
      <Text style={{color: 'white'}}>Call ID: {formatSlug(slug)}</Text>
    </TouchableOpacity>
  )
}

export default RoomId