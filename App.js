
import React, {useState}                            from 'react';
import { StyleSheet }                               from 'react-native';
import {Box, NativeBaseProvider, Input, FlatList }  from 'native-base';

/*
A platform for text chat game. 
Anyone can use it for what ever game they want.
Everything is turn-based, because it's natural.

phase 1:
- implement rooms with exits and movement commands. 

*/

const WORLD = {
  "room_0": {
    description: "This is Room 0.",
    exits:      {"N": "room_1"}
  },
  "room_1": {
    description: "This is Room 1.",
    exits:      {"S": "room_0"}
  }
}

let player_obj = {
  location: WORLD.room_0
}


let chat_item_id = 0;

const chat_data = [
  {id: "0", text: generate_room_text(WORLD.room_0), is_user_text: false}  
];

//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
function generate_room_text(room){
  let text = room.description;
  text += '\nExits: ';
  for (const exit in room.exits){
    text += exit + ' ';
  }
  return text;
}

//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
function ChatBox(props){
  
  if (props.is_user_text){
    return (
      <Box style={[styles.chat_box, {alignSelf:'flex-end', backgroundColor: 'pink'}]}>
        {props.text}
      </Box>
    )
  } else {
    return (
      <Box style={[styles.chat_box, {alignSelf:'flex-start'}]}>
        {props.text}
      </Box>
    )
  } 
}

//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
export default function App() {

  const [refreshFlatlist, setRefreshFlatlist] = useState(false); 

  /////////////////////////
  const update = (text_input) => {

    //If navigation command, we need to check if the room
    //has the required exit. If so - move the player to that
    //new room and show a description.

    // if ()){
    //   //
    // } else {
    //   //respond with no exit available.
    // }


    chat_item_id = chat_item_id+1;
    let id = chat_item_id.toString(10);

    let d = {id: id, text: "Hi3", is_user_text: true};
    chat_data.push(d);
    setRefreshFlatlist(refreshFlatlist => !refreshFlatlist);    
  }

  return (
    <NativeBaseProvider>
      <Box style={styles.container} safeArea>        
        
        <FlatList 
          extraData=  {refreshFlatlist}
          data=       {chat_data}
          keyExtractor={(item)=> item.id}
          renderItem={({item})=> (                        
            <ChatBox text={item.text} is_user_text={item.is_user_text} />            
          )}          
        />
        
        <Input
          selectTextOnFocus={true}
          width="100%"
          onSubmitEditing={(event)=>{            
            update(event.nativeEvent.text);            
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
  },
  chat_box: {
    alignSelf: 'flex-start',
    backgroundColor: 'cyan',
    padding: 4,
    margin: 5
  }
});
