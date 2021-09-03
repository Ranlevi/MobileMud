import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import {Box, NativeBaseProvider, Input } from 'native-base';

/*
A platform for text chat game. 
Anyone can use it for what ever game they want.
Everything is turn-based, because it's natural.

*/

function TextBallon(props){

  return (
    <Box 
      bg="primary.100"
    >
      {props.text}
    </Box>
  )
}



export default function App() {
  return (
    <NativeBaseProvider>
      <StatusBar style="auto" />
      <Box style={styles.container}>
        <TextBallon text="You see a spider." />
        <Input 
          selectTextOnFocus={true}
          isFullWidth={true}
          onSubmitEditing={(event)=>{
            if (event.nativeEvent.text==="ה"){
              console.log("GGG");
            }
            
          }}
        />
        
      </Box>
    </NativeBaseProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
