
import React, {useState}                            from 'react';
import { StyleSheet, Text }                         from 'react-native';
import {Box, NativeBaseProvider, Input, FlatList }  from 'native-base';
import {Link, Actionsheet }                         from 'native-base';

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

const WORLD = {
  'ABCD': {
    type:             "room",
    name:             "ROOM0",
    description:      "This is a normal room.",
    exits:            {'north': 'ABCE'},
    entities:         ['0001', '0002']
  },
  'ABCE': {
    type:             "room",
    name:             "ROOM1",
    exits:            {'south': 'ABCD'},
    description:      "This is another normal room.",
    entities:         []
  },
  '0001': {
    type:             'npc',
    name:             'Archie', 
    description:      "This is a Dog."},
  '0002': {
    type:             'npc', 
    name:             'Bella', 
    description:      "This is a Cat."}
}

let player_obj = {
  current_room_id: 'ABCD'
}

let chat_data = [
  {id:                      "1", 
   template:                "look_room", 
   options: {
    room_id:                "ABCD",
     name:                  "ROOM0",     
     description:           "This is a normal room.",
     exits:                 ['north'],
     entities:[
      {name:               'Archie',
       id:                 '0001'
      },
      {name:               'Bella',
       id:                 '0002'
      }
     ]
   }}  
];

//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
function parse_input(input){
  let parsed_input = {
    command: null,
    target:  null
  };
  
  let normalized_text= input.trim().toLowerCase();  
  let re = /\s+/g; //search for all white spaces.
  let arr = normalized_text.split(re);

  if (arr.length===0){
    //Do nothing
  } else if (arr.length===1){
    parsed_input.command = arr[0];  
  } else if (arr.length===2){
    parsed_input.command = arr[0];
    parsed_input.target  = arr[1];
  }  
    
  return parsed_input;
}

//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
function generate_new_id_for_chat_data(){
  let current_id =  parseInt(chat_data[chat_data.length-1].id);    
  let new_id     = (current_id+1).toString(10);  
  return new_id;
}

//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
function look_cmd(target=null){
  //Generate a chat_data item in the 'look' template.
  //target is matched by name.
  
  
  if (target===null){
    //Default for 'look' is to look at current room.
    target = WORLD[player_obj.current_room_id].name.toLowerCase();
  }  

  

  let item;
  
  if (target===WORLD[player_obj.current_room_id].name.toLowerCase()){
    
    //Looking at the current room
    let room_name =         WORLD[player_obj.current_room_id].name;
    let room_description =  WORLD[player_obj.current_room_id].description;
    let exits =             Object.keys(WORLD[player_obj.current_room_id].exits);    
    let entities =          WORLD[player_obj.current_room_id].entities.map(arr_item => {
      let obj  = {};
      obj.name = WORLD[arr_item].name;
      obj.id   = arr_item;
      return obj;    
    });
  
    item = {
      id:                 generate_new_id_for_chat_data(),
      template:           "look_room",
      options: {
        room_id:          player_obj.current_room_id,
        name:             room_name,
        description:      room_description,
        exits:            exits,
        entities:         entities
      }
    }

  } else {
    //Try to match the entities
    let target_found = false;

    for (const entity_id of WORLD[player_obj.current_room_id].entities){
      let entity_name = WORLD[entity_id].name.toLowerCase();
      if (target===entity_name){
        target_found = true;
        item = {
          id:                   generate_new_id_for_chat_data(),
          template:             "look_entity",
          options: {
            name:               WORLD[entity_id].name,
            id:                 entity_id,
            description:        WORLD[entity_id].description
          }
        }
      }
    }

    if (!target_found){
    //no suitable target found. Generate message to user.
      item = {
        id:           generate_new_id_for_chat_data(),
        template:     'generic_message',
        options: {
          content:    `There is no ${target} around here.`
        }
      }
    }
  }   
  
  chat_data.push(item);    
}

//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
function move_cmd(cmd){  
  
  switch(cmd){
    case('n'):
      cmd = 'north';
      break;
    case('s'):
      cmd = 'south';
      break;
    case('e'):
      cmd = 'east';
      break;
    case('w'):
      cmd = 'west';
      break;
    case('u'):
      cmd = 'up';
      break;
    case('d'):
      cmd = 'down';
      break;
  }
  
  let next_room_id =  WORLD[player_obj.current_room_id].exits[cmd];
  
  if (next_room_id!==undefined){
    player_obj.current_room_id =next_room_id;
    look_cmd();
  } else {
    let item = {
      id:           generate_new_id_for_chat_data(),
      template:     'generic_message',
      options: {
        content:    `There is no exit to ${cmd}.`
      }
    }
    chat_data.push(item);  
  }
}

//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
function ChatArea(props){
  //Telegram-like UI element. Gets a chat_data array and displays
  //it as a FlatList of Boxes. Each box is rendered according
  //to a pre-determined template.
  //

  //----------------------------------------------------------
  function renderItem({item}){

    if (item.template==="look_room"){
      return (
        <Box style={styles.chat_box_system}>
          <Link 
            isUnderlined 
            onPress={()=> props.handle_link_click('room', item.options.room_id)}
          >
            {item.options.name}
          </Link>
          <Text>{item.options.description}</Text>
          <Text>Exits:</Text>
          {item.options.exits.map((direction)=> 
            <Link
              isUnderlined
              key={direction}
              onPress={()=> props.handle_link_click('command', direction)}              
            >
              {direction}
            </Link>
          )}
          <Text>You see:</Text>
          {item.options.entities.map((arr_item)=>
            <Link 
              key={arr_item.id} 
              isUnderlined 
              onPress={()=> props.handle_link_click('npc', arr_item.id)}
            >
              {arr_item.name}
            </Link>
          )}
        </Box>  
      )

    } else if (item.template==="look_entity"){
      return (
        <Box style={styles.chat_box_system}>
          <Link 
            isUnderlined 
            onPress={()=> props.handle_link_click('npc', item.options.id)}
          >
            {item.options.name}
          </Link>
          <Text>{item.options.description}</Text>          
        </Box> 
      );

    } else if (item.template==="generic_message"){
      return (
        <Box style={styles.chat_box_system}>
          <Text>{item.options.content}</Text>
        </Box>
      );
    }
  };
  //----------------------------------------------------------

  return (
    <FlatList 
      extraData=    {props}
      data=         {props.chat_data}
      keyExtractor= {(item)=> item.id}
      renderItem=   {renderItem}          
    />
  )
}

//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
export default function App() {    
  
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [actionsheetType, setActionsheetType] = useState("");
  const [actionsheetName, setActionsheetName] = useState("");
  const [refreshChatArea, setRefreshChatArea] = useState(false);
    
  //----------------------------
  function process_input(text){
    
    let parsed_input = parse_input(text);    
    
    switch(parsed_input.command){
      case(null):
        break;

      case('look'):
      case('l'):
      case('lo'):
      case('loo'):        
        look_cmd(parsed_input.target);
        break;

      case('north'):
      case('n'):
      case('south'):
      case('s'):
      case('west'):
      case('w'):
      case('east'):
      case('e'):
      case('up'):
      case('u'):
      case('down'):
      case('d'):      
        move_cmd(parsed_input.command);
        break;
    }
        
  }
  
  //----------------------------
  function link_clicked(type, data){
    //Handles clicks on link, according to their type.
    
    if (type==="room"){
      //Set options for the Actionsheet
      setActionsheetType(WORLD[data].type);
      setActionsheetName(WORLD[data].name);
      setShowActionSheet(true);    
    } else if (type==="npc"){
      //Set options for the Actionsheet
      setActionsheetType(WORLD[data].type);
      setActionsheetName(WORLD[data].name);
      setShowActionSheet(true);    
    } else if (type==="command"){
      //Pass on as if a user-typed input.
      //Neet to refrsh chat - else it doesn't know it need to redraw Flatlist.
      setRefreshChatArea(refreshChatArea => !refreshChatArea);
      process_input(data); 
    }
    
  }  

  //----------------------------
  function get_actionsheet_items(){

    if (actionsheetType==="room"){
      let cmd = `look ${actionsheetName}`;

      return(
        <Actionsheet.Item 
          onPress={()=> {
            setShowActionSheet(false);
            process_input(cmd);
          }}
        >
        {cmd}
        </Actionsheet.Item>
      )
    
    } else if (actionsheetType==="npc"){
      let cmd = `look ${actionsheetName}`;

      return(
        <Actionsheet.Item 
          onPress={()=> {
            setShowActionSheet(false);
            process_input(cmd);
          }}
        >
        {cmd}
        </Actionsheet.Item>
      )
    }
  }
  
  return (
    <NativeBaseProvider>
      <Box style={styles.container} safeArea>

        <ChatArea chat_data={chat_data} handle_link_click={link_clicked}/>

        <Input
          selectTextOnFocus=  {true}
          width=              "100%"
          onSubmitEditing=    {(evt)=> process_input(evt.nativeEvent.text)}
        />
      </Box>

      <Actionsheet isOpen={showActionSheet}>
        <Actionsheet.Content>        
          {get_actionsheet_items()}
        </Actionsheet.Content>
      </Actionsheet>
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
