
import React, {useState}                            from 'react';
import { StyleSheet, Text }                         from 'react-native';
import {Box, NativeBaseProvider, Input, FlatList }  from 'native-base';
import {Link }                                      from 'native-base';

/*
A platform for text chat game. 
Anyone can use it for what ever game they want.
Everything is turn-based, because it's natural.

phase 1:
- implement rooms with exits and movement commands. 
phase 2: 
- implement NPC in the rooms, with no interaction.
- implement clickable words that open menu of possible actions.

*/

// const WORLD = {
//   "room_0": {
//     name:        "Room 0",
//     description: "This is Room 0.",
//     exits:      {"north": "room_1"},
//     entities:   ['0001']
//   },
//   "room_1": {
//     name:        "Room 1",
//     description: "This is Room 1.",
//     exits:      {"south": "room_0"},
//     entities:   ['0001']
//   }
// }

// const player_obj = {
//   location: "room_0"
// }

// const ENTITIES = {
//   '0001': {    
//     name:         'Archie',
//     type:         'Dog',
//     description:  'This is Archie. He is not very smart.',
//     location:     'room_1'  
//   }
// }

// let chat_item_id = 0;
// const chat_data = [  
//   {id: "0", msg_type: "entering_room", options: {room_name: 'room_0'}}
// ];

//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
// function ChatBox(props){

//   const [refreshFlatlist, setRefreshFlatlist] = useState(false); 

//   return (
//     <FlatList 
//       extraData=  {refreshFlatlist}
//       data=       {props.data}
//       keyExtractor={(item)=> item.id}
//       renderItem={({item})=> (                                
//         <Box style={styles.chat_box_system}>{item.msg_type}</Box>
//       )}          
//     />
//   )
// }







// //////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////
// function generate_room_text(room){
  
//   let text = room.description;
//   if (room.entities.length!==0){
//     text += '\nIn the room with you:';
//     for (const entity_id of room.entities){      
//       text += '\n' + ENTITIES[entity_id].name;
//     }
//   }

//   text += '\nExits: ';
//   for (const exit in room.exits){
//     text += exit + ' ';
//   } 

//   return text;
// }

//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
// function ChatBox(props){

//   if (props.data.msg_type==="entering_room"){

//     let room_obj= WORLD[props.data.options.room_name]; 
      
//     let entities_section= null;
//     if (room_obj.entities.length!==0){
//       entities_section = room_obj.entities.map((entity_id) =>
//         <Link isUnderlined key={entity_id}>{ENTITIES[entity_id].name}</Link>
//       );      
//     }

//     return (
//       <Box style={styles.chat_box_system}>
//         <Link isUnderlined>{room_obj.name} onPress={toggleActionSheet('room')}</Link>
//         <Text>{room_obj.description}</Text>
//         <Text>In the room with you:</Text>
//         {entities_section}
//       </Box>
//     )
//   }

  
//   // if (props.is_user_text){
//   //   return (
//   //     <Box style={[styles.chat_box, {alignSelf:'flex-end', backgroundColor: 'pink'}]}>
//   //       {props.text}
//   //     </Box>
//   //   )
//   // } else {
//   //   return (
//   //     <Box style={[styles.chat_box, {alignSelf:'flex-start'}]}>
//   //       {/* {props.text} */}
//   //       {text}
//   //     </Box>
//   //   )
//   // } 
// }

//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
// export default function App() {

  // const [refreshFlatlist, setRefreshFlatlist] = useState(false); 

  // //////////////////////////////////////////////////////////
  // function generate_chat_data(text, is_user_text){
  //   chat_item_id = chat_item_id+1;
  //   let data = {
  //     id:           chat_item_id.toString(10),
  //     text:         text,
  //     is_user_text: is_user_text
  //   };
  //   chat_data.push(data);
  //   setRefreshFlatlist(refreshFlatlist => !refreshFlatlist);    
  // }

 
  // /////////////////////////
  // const process_input = (text_input) => {

  //   //If navigation command, we need to check if the room
  //   //has the required exit. If so - move the player to that
  //   //new room and show a description.

  //   generate_chat_data(text_input, true);

  //   text_input = text_input.trim().toLowerCase();

  //   switch (text_input){
  //     case ("n"):
  //       text_input = 'north';
  //       break;

  //     case ("s"):
  //       text_input = 'south';
  //       break;

  //     case ("e"):
  //       text_input = 'east';
  //       break;

  //     case ("w"):
  //       text_input = 'west';
  //       break;
  //   }
    
  //   const POSSIBLE_EXITS = ['north', 'south', 'east', 'west'];

  //   if (POSSIBLE_EXITS.includes(text_input)){
  //     //This is a movement command.
  //     if (WORLD[player_obj.location].exits.hasOwnProperty(text_input)){
  //       generate_chat_data("You Move to the next room.", false);
        
  //       //Move the player and display room description.
  //       player_obj.location = WORLD[player_obj.location].exits[text_input];        
  //       let room_text = generate_room_text(WORLD[player_obj.location]);
  //       generate_chat_data(room_text, false);

  //     } else {
  //       generate_chat_data("Exit Not Available", false);  
  //     }
  //   } else {
  //     generate_chat_data("Unknown command.", false);  
  //   }
    
  //   setRefreshFlatlist(refreshFlatlist => !refreshFlatlist);    
  // }

//   return (
//     <NativeBaseProvider>
//       <Box style={styles.container} safeArea>        
        
//         <ChatBox data={chat_data}/>

//         {/* <FlatList 
//           extraData=  {refreshFlatlist}
//           data=       {chat_data}
//           keyExtractor={(item)=> item.id}
//           renderItem={({item})=> (                        
//             // <ChatBox text={item.text} is_user_text={item.is_user_text} />
//             <ChatBox data={item}/>
//           )}          
//         /> */}
        
//         <Input
//           selectTextOnFocus={true}
//           width="100%"
//           onSubmitEditing={(event)=>{            
//             process_input(event.nativeEvent.text);            
//           }}
//         />
//       </Box>
//     </NativeBaseProvider>
//   )

// }

function ChatArea(props){
  
  return (
    <FlatList 
      extraData=    {props}
      data=         {props.chat_data}
      keyExtractor= {(item)=> item.id}
      renderItem=   {({item})=>(
        <Box>{item.text}</Box>
      )}          
    />
  )
}



export default function App() {  
  
  let chat_data = [
    {id:"0001", text:"This is a test."}  
  ];

  function process_input(evt){

    chat_data.push({id:"0002", text: evt.nativeEvent.text});        
  }

  return (
    <NativeBaseProvider>
      <Box style={styles.container} safeArea>

        <ChatArea chat_data={chat_data} />

        <Input
          selectTextOnFocus={true}
          width="100%"
          onSubmitEditing={process_input}
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
  chat_box_system: {
    alignSelf: 'flex-start',
    backgroundColor: 'cyan',
    padding: 4,
    margin: 5    
  }
});
