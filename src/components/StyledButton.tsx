import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'

const StyledButton = ({ title, onPress, style }: { title: string; onPress: () => void; style?: any }) => {
    return (
        <TouchableOpacity style={{
            backgroundColor: "white",
            padding: 12,
            borderRadius: 5,
            width: "100%",
            ...style
        }}
        onPress={onPress}
        >
            <Text style={{
                color: "#5F5DEC",
                fontSize: 16,
                textAlign: 'center',
                fontWeight: 'bold'
            }}>{title}</Text>
        </TouchableOpacity>
    )
}

export default StyledButton