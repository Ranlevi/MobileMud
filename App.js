
import React, {useState, useRef}                    from 'react';
import { StyleSheet }                               from 'react-native';
import {Box, NativeBaseProvider, Input, FlatList }  from 'native-base';
import {Link, Actionsheet, Text, Modal }            from 'native-base';

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
    description:      "This is a Dog.",
    health:           1000,
    damage:           1,
    fighting_with_id: null
  },
  '0002': {
    type:             'npc', 
    name:             'Bella', 
    description:      "This is a Cat.",
    health:           10,
    damage:           1,
    fighting_with_id: null
  }
}

let player_obj = {
  id:               '1234',
  name:             'Harpoon',
  current_room_id:  'ABCD',
  health:           100,
  damage:           1,
  fighting_with_id: null
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
function get_entity_id_by_name(name){
  //   
  for (const entity_id of WORLD[player_obj.current_room_id].entities){
    let entity_name = WORLD[entity_id].name.toLowerCase();
    if (entity_name===name){
      return entity_id;
    }
  }
  return null;
}

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
  } else {
    parsed_input.command = arr[0];
    parsed_input.target = arr.slice(1).join(' ');
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
function generate_new_id_for_entity(){
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random()*charactersLength));
 }
 return result;
}

//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
function kill_cmd(target=null){

  let target_id = null;
  
  if (target===null){
    let item = {
      id:       generate_new_id_for_chat_data(),
      template: 'generic_message',
      options: {
        content: "Who do you want to kill?"
      }        
    }
    chat_data.push(item);    
  } else {
    //Try to match the target with the entities in the room.
    target_id = get_entity_id_by_name(target);
    if (target_id===null){
      let item = {
        id:       generate_new_id_for_chat_data(),
        template: 'generic_message',
        options: {
          content: "There's no entity with this name in the room."
        }        
      }
      chat_data.push(item);
    } else {
      //We have a match
      player_obj.fighting_with_id = target_id;
      WORLD[target_id].fighting_with_id = player_obj.id;
    } 
  }
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
  const ChatAreaRef = useRef();

  //--------------------------------------- -------------------
  function renderItem({item}){

    if (item.template==="look_room"){
      return (
        <Box 
          style={styles.chat_box_system} 
          borderRadius="10px" 
          borderBottomLeftRadius="0px"
          borderColor="primary.600"
          borderWidth="3px"
          >
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
        <Box 
          style={styles.chat_box_system} 
          borderRadius="10px" 
          borderBottomLeftRadius="0px"
          borderColor="primary.600"
          borderWidth="3px"
          >
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
        <Box 
          style={styles.chat_box_system} 
          borderRadius="10px" 
          borderBottomLeftRadius="0px"
          borderColor="primary.600"
          borderWidth="3px"
          >
          <Text>{item.options.content}</Text>
        </Box>
      );

    } else if (item.template==="user_text"){
      return (
        <Box 
          style={styles.chat_box_user} 
          borderRadius="10px" 
          borderBottomRightRadius="0px"
          borderColor="red.500"
          borderWidth="2px"
          >
          <Text>{item.options.content}</Text>
        </Box>
      )
    }
  };
  //----------------------------------------------------------

  return (
    <FlatList 
      ref={ChatAreaRef}
      onContentSizeChange={()=> ChatAreaRef.current.scrollToEnd()}
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
  const [showCombatModal, setShowCombatModal] = useState(false);
  const [combatModalText, setCombatModalText] = useState("");
  const [refreshChatArea, setRefreshChatArea] = useState(false);
  const [infoBarText,     setInfoBarText]     = useState("Health: 100");
  
  setInterval(()=>{
    game_loop();
  },1000);

  let tick = 0;
  //--------------------------------
  function game_loop(){
    tick += 1;
    console.log(tick);
    //Handle fights
    if (player_obj.fighting_with_id!==null){

      if (showCombatModal===false) setShowCombatModal(true);
      
      player_obj.health -= WORLD[player_obj.fighting_with_id].damage;
      WORLD[player_obj.fighting_with_id].health -= player_obj.damage;

      let text = 
        `You: ${player_obj.health} HP\n${WORLD[player_obj.fighting_with_id].name}:
         ${WORLD[player_obj.fighting_with_id].health}\n\n
         You strike ${WORLD[player_obj.fighting_with_id].name}\n
          ${WORLD[player_obj.fighting_with_id].name} strikes you.
        `  
      setCombatModalText(text);
      
      if (WORLD[player_obj.fighting_with_id].health===0){
                
        item = {
          id:         generate_new_id_for_chat_data(),
          template:   'generic_message',
          options: {
            content: `You WIN!`
          }        
        }
        chat_data.push(item);
        setRefreshChatArea(refreshChatArea => !refreshChatArea);
        setShowCombatModal(false);

        //Transform entity to corpse
        WORLD[player_obj.fighting_with_id].fighting_with_id = null;
        WORLD[player_obj.fighting_with_id].name             = `The corpse of ${WORLD[player_obj.fighting_with_id].name}`;
        WORLD[player_obj.fighting_with_id].description      = `It's dead, Jim.`;
        WORLD[player_obj.fighting_with_id].type             = 'corpse';

        setInfoBarText(`Health: ${player_obj.health}`);

        //Stop the fight
        player_obj.fighting_with_id = null;
      } else if (player_obj.health===0){
        //player died.
        //generate a new corpse entity, transport the player to starting room.
        let corpse_new_id = generate_new_id_for_entity();

        WORLD[corpse_new_id] = {
          type:             'corpse',
          name:             `The Corpse of ${player_obj.name}`, 
          description:      "It's dead, Jim.",
          health:           0,
          damage:           0,
          fighting_with_id: null
        }

        WORLD[player_obj.current_room_id].entities.push(corpse_new_id);
        player_obj.current_room_id = 'ABCD';
        player_obj.health = 100;

        WORLD[player_obj.fighting_with_id].fighting_with_id = null;
        player_obj.fighting_with_id = null;
        setShowCombatModal(false);

      }
    }

  }   

  //----------------------------
  function process_input(text){
    
    //Display the command on the chat
    let item = {
      id:         generate_new_id_for_chat_data(),
      template:   "user_text",
      options: {
        content: text
      }
    };
    chat_data.push(item);
    setRefreshChatArea(refreshChatArea => !refreshChatArea);
    
    //Process the input
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

      case('k'):
      case('ki'):
      case('kil'):
      case('kill'):
        kill_cmd(parsed_input.target);
        break;
    }
        
  }
  
  //----------------------------
  function link_clicked(type, data){
    //Handles clicks on link, according to their type.
    
    if (type==="room" || type==="npc" || type==="corpse"){
      //Set options for the Actionsheet
      setActionsheetType(WORLD[data].type);
      setActionsheetName(WORLD[data].name);
      setShowActionSheet(true);    
    } else if (type==="command"){
      //Pass on as if a user-typed input.
      process_input(data);       
    } 
    
  }  

  //----------------------------
  function get_actionsheet_items(){

    if (actionsheetType==="room"){
      let cmd = `look ${actionsheetName}`;

      return(
        <Actionsheet.Content>
          <Actionsheet.Item 
            onPress={()=> {
              setShowActionSheet(false);
              process_input(cmd);
            }}
          >
          {cmd}
          </Actionsheet.Item>
        </Actionsheet.Content>
      )
    
    } else if (actionsheetType==="npc"){
      let look_cmd = `look ${actionsheetName}`;
      let kill_cmd = `kill ${actionsheetName}`
      return(
        <Actionsheet.Content>
          <Actionsheet.Item 
            onPress={()=> {
              setShowActionSheet(false);
              process_input(look_cmd);
            }}
          >
          {look_cmd}
          </Actionsheet.Item>

          <Actionsheet.Item 
          onPress={()=> {
            setShowActionSheet(false);
            process_input(kill_cmd);
          }}
        >
        {kill_cmd}
        </Actionsheet.Item>
      </Actionsheet.Content>
      )
    } else if (actionsheetType==="corpse"){
      let cmd = `look ${actionsheetName}`;

      return(
        <Actionsheet.Content>
          <Actionsheet.Item 
            onPress={()=> {
              setShowActionSheet(false);
              process_input(cmd);
            }}
          >
          {cmd}
          </Actionsheet.Item>
        </Actionsheet.Content>
      )
    }
  }
  
  return (
    <NativeBaseProvider>
      <Box style={styles.container} safeArea>

        <ChatArea chat_data={chat_data} handle_link_click={link_clicked} />

        <Box backgroundColor="white">
          <Text fontSize="lg" >{infoBarText}</Text>
        </Box>

        <Input
          selectTextOnFocus=  {true}
          width=              "100%"
          onSubmitEditing=    {(evt)=> process_input(evt.nativeEvent.text)}
        />
      </Box>

      <Actionsheet 
        isOpen={showActionSheet}
        onClose={()=> setShowActionSheet(false)}
      >
        {get_actionsheet_items()}        
      </Actionsheet>

      <Modal isOpen={showCombatModal}>
        <Modal.Content>
          <Modal.Header>Battle!</Modal.Header>
          <Modal.Body>{combatModalText}</Modal.Body>
        </Modal.Content>
      </Modal>
    </NativeBaseProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#495057',            
  },
  chat_box_system: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    padding: 4,
    margin: 5    
  },
  chat_box_user: {
    alignSelf: 'flex-end',
    backgroundColor: '#FFFFFF',
    padding: 4,
    margin: 5    
  }
});
