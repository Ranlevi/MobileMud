
import React, {useState} from 'react';
import { StyleSheet } from 'react-native';
import {Box, NativeBaseProvider, Input, FlatList, Flex } from 'native-base';

// /*
// A platform for text chat game. 
// Anyone can use it for what ever game they want.
// Everything is turn-based, because it's natural.

// */
let chat_item_id = 1;

const chat_data = [
  {id: "0", text: "This is A Test"},
  {id: "1", text: "This is A Test"}
];

export default function App() {

  const [refreshFlatlist, setRefreshFlatlist] = useState(false); 

  const update = () => {

    chat_item_id = chat_item_id+1;
    let id = chat_item_id.toString(10);

    let d = {id: id, text: "Hi3"};
    chat_data.push(d);
    setRefreshFlatlist(refreshFlatlist => !refreshFlatlist);    
  }

  return (
    <NativeBaseProvider>
      <Box style={styles.container} safeArea>

        <FlatList 
          extraData={refreshFlatlist}
          data={chat_data}
          renderItem={({item})=> (            
            <Box style={styles.item} bg="primary.400" p={4}>{item.text}</Box>
            
          )}
          keyExtractor={(item)=> item.id}
        />
        
        <Input
          selectTextOnFocus={true}
          width="100%"
          onSubmitEditing={(event)=>{
            if (event.nativeEvent.text==="L"){
              update();
            }
          }}
        />
      </Box>
    </NativeBaseProvider>
  )

}

const styles = StyleSheet.create({
  container: {
    flex: 1,    
    backgroundColor: '#fff',
    flexDirection: 'column', //main axis - colum    
    // alignItems: 'center',
    
  },
  item: {
    // width: "fit-content"
  }
});
