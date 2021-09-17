import React, {useState, useRef}                    from 'react';
import { StyleSheet }                               from 'react-native';
import {Box, NativeBaseProvider, Input, FlatList }  from 'native-base';
import {Link, Actionsheet, Text, Modal }            from 'native-base';

/* 
Design conventions:
- every string is converted to lower case before comparison.

*/


//-- Entities Classes

//////////////////////////////
//////////////////////////////
class Room {
  constructor(){
    this.id           = get_new_id();
    this.type         = "room";
    this.name         = "A Simple Room";
    this.description  = "This is a plain, 3m by 3m room.";
    this.exits        = {
      'north': null,
      'sound': null,
      'west':  null,
      'east':  null,
      'up':    null,
      'down':  null
    },
    this.entities     = []
  }

  set_name(name){
    this.name = name;
  }

  set_description(description){
    this.description = description;
  }

  add_exit(direction, next_room_id){
    this.exits[direction] = next_room_id;
  }

  remove_exit(direction){
    this.exits[direction] = null;
  }

  get_exits(){
    let exits = [];
    for (const [direction, next_room_id] of Object.entries(this.exits)){
      if (next_room_id!==null){
        exits.push(direction);
      }
    }
    return exits;
  }

  add_entity(entity_id){
    this.entities.push(entity_id);
  }

  remove_entity(entity_id){
    let ix = this.entities.indexOf(entity_id);
    if (ix!==-1){
      this.entities.splice(ix,1);
    }
  }   
}

//////////////////////////////
//////////////////////////////
class Player {
  constructor(){
    this.type=              'player';
    this.id=                get_new_id();
    this.name=              'Player';
    this.description=       "It's you, bozo.";
    this.hp=                100;
    this.damage=            1;
    this.fighting_with_id=  null;
    this.current_room_id=   null;
  }
}

//-- Game Setup

let   current_id=           0; //IDs are of type Number.
const World=                new Map();
let   chat_data=            [];
let   current_chat_item_id= 0;
let   player_id=            null;


///////////////////////////////////////////////
///////////////////////////////////////////////
function init_world(){

  let room=             new Room();
  room.set_name("Room 1");
  room.set_description("This is the starting room of the game.");
  World.set(room.id, room);

  let room2=              new Room();
  room2.set_name("Room 2");
  room2.set_description("This is the 2nd room of the game.");
  room2.add_exit('south', room.id);
  World.set(room2.id, room2);

  room.add_exit('north', room2.id);

  let player = new Player();
  player.current_room_id = room.id;
  room.add_entity(player.id);
  World.set(player.id, player);

  player_id = player.id;

  add_chat_item('look_room', {room_id: room.id});    
}

init_world();

//-- Utitility Functions

//////////////////////////////
//////////////////////////////
function get_new_id(){
  current_id = current_id+1;
  return current_id;
}

function test(){
  console.log('hi');
}

///////////////////////////////////////////////
///////////////////////////////////////////////
function add_chat_item(template, data){
  //get data and converts it to a chat item format.

  //template="look_room", data: {room_id: Number}
  let content;
  if (template==="look_room"){
    let room = World.get(data.room_id);
        
    content = <Box>
                <Text 
                  color="blue.500" 
                  underline 
                  fontSize="xl"
                  onPress={()=> test()}
                >
                  {room.name}
                </Text>
                <Text>This is a line</Text>
              </Box>
  }

  current_chat_item_id = current_chat_item_id+1;
  let chat_item = {
    id:       current_chat_item_id.toString(),
    template: template,
    content:  content
  };


  /*
  current_chat_item_id = current_chat_item_id+1;
  let chat_item = {
    id:       current_chat_item_id.toString(),
    template: template,
    data:     null
  };

  if (template==="look_room"){

    let room = World.get(data.room_id);

    chat_item.data = {      
      id:           room.id,
      name:         room.name,
      description:  room.description,
      exits:        room.get_exits(),
      entities:     room.entities
    }
  } else if (template==="user_text"){
    chat_item.data = {
      content: data.content
    }
  } else if (template==="look_entity"){

    let entity = World.get(data.entity_id);

    chat_item.data = {
      id:           entity.id,
      name:         entity.name,
      description:  entity.description
    }
  } else if (template==="generic_message"){
    chat_item.data = {
      content: data.text
    }
  }

  */

  chat_data.push(chat_item);
}

///////////////////////////////////////////////
///////////////////////////////////////////////
function parse_user_input(input){

  let cmd     = null;
  let target  = null;
  
  let normalized_text= input.trim().toLowerCase();  
  let re = /\s+/g; //search for all white spaces.
  let arr = normalized_text.split(re);

  if (arr.length===0){
    //Do nothing
  } else if (arr.length===1){
    cmd= arr[0];  
  } else {
    cmd=    arr[0];
    target= arr.slice(1).join(' ');
  }

  switch(cmd){
    case(null):
        break;
    
    case('l'):
    case('lo'):
    case('loo'):        
      cmd='look';
      break;

    case('n'):
      cmd='north';
      break;
    
    case('s'):
      cmd='south';
      break;

    case('w'):
      cmd='west';
      break;

    case('e'):
      cmd='east';
      break;
    
    case('u'):
      cmd='up';
      break;
        
    case('d'):      
      cmd='down';
      break;

    case('k'):
    case('ki'):
    case('kil'):    
      cmd='kill';
      break;
    
  }
    
  return [cmd, target];
}

//-- Components

///////////////////////////////////////////////
///////////////////////////////////////////////
function LookRoom_ChatBox(props){
  
  return (
    <Box 
      style=                  {styles.chat_box_system} 
      borderRadius=           "10px" 
      borderBottomLeftRadius= "0px"
      borderColor=            "primary.600"
      borderWidth=            "3px"
    >
      <Link 
        isUnderlined 
        onPress={()=> props.link_handler('room', props.item.data.id)}
      >
        {props.item.data.name}
      </Link>
      <Text>{props.item.data.description}</Text>

      <Text>Exits:</Text>
      {props.item.data.exits.map((direction)=> 
        <Link
          isUnderlined
          key=    {direction}
          onPress={()=> props.link_handler('command', direction)}              
        >
          {direction}
        </Link>
      )}

      <Text>In the room:</Text>
      {(props.item.data.entities.length===0) ? 
        "The room is empty." : 
        (props.item.data.entities.map((entity_id)=>             
            <Link 
              isUnderlined 
              key=      {entity_id.toString()}               
              onPress=  {()=> props.link_handler(World.get(entity_id).type, entity_id)}
            >
            {World.get(entity_id).name}
            </Link>
        )                
      )}
    </Box>  
  )  
}

///////////////////////////////////////////////
///////////////////////////////////////////////
function LookEntity_ChatBox(props){
  return (
    <Box 
      style=                  {styles.chat_box_system} 
      borderRadius=           "10px" 
      borderBottomLeftRadius= "0px"
      borderColor=            "primary.600"
      borderWidth=            "3px"
      >
      <Link 
        isUnderlined 
        onPress={()=> props.link_handler('entity', props.item.data.id)}
      >
        {props.item.data.name}
      </Link>
      <Text>{props.item.data.description}</Text>          
    </Box> 
  );
}

///////////////////////////////////////////////
///////////////////////////////////////////////
function SystemMessage_ChatBox(props){
  return (
    <Box 
      style=                  {styles.chat_box_system} 
      borderRadius=           "10px" 
      borderBottomLeftRadius= "0px"
      borderColor=            "primary.600"
      borderWidth=            "3px"
      >
      <Text>{props.item.data.content}</Text>
    </Box>
  );
}

///////////////////////////////////////////////
///////////////////////////////////////////////
function UserText_ChatBox(props){
  return (
    <Box 
      style=                  {styles.chat_box_user} 
      borderRadius=           "10px" 
      borderBottomRightRadius="0px"
      borderColor=            "red.500"
      borderWidth=            "2px"
      >
      <Text>{props.item.data.content}</Text>
    </Box>
  )
}

///////////////////////////////////////////////
///////////////////////////////////////////////
function ChatArea(props){
  
  const ChatAreaRef = useRef();

  //--------------------------------------- -------------------
  function renderItem({item}){
    
    return (
      <Box 
        style=                  {styles.chat_box_system} 
        borderRadius=           "10px" 
        borderBottomLeftRadius= "0px"
        borderColor=            "primary.600"
        borderWidth=            "3px"
      >
        {item.content}
      </Box>      
    )
    /*

    if (item.template==="look_room"){
      return (
        <LookRoom_ChatBox item={item} link_handler={props.link_handler}/>
      )

    } else if (item.template==="look_entity"){
      return (
        <LookEntity_ChatBox item={item} link_handler={props.link_handler}/>
      );

    } else if (item.template==="generic_message"){
      return (
        <SystemMessage_ChatBox item={item}/>
      );

    } else if (item.template==="user_text"){
      return (
        <UserText_ChatBox item={item} />
      )
    }

    */
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

///////////////////////////////////////////////
///////////////////////////////////////////////
function InfoBar(props){
  return(
    <Box backgroundColor="white">
      <Text fontSize="lg" >{props.text}</Text>
    </Box>
  )
}

///////////////////////////////////////////////
///////////////////////////////////////////////
function CommandsActionsheet(props){

  return(
    <Actionsheet isOpen={props.openCmdActnSht} disableOverlay>
      <Actionsheet.Content>        
        {props.content}
      </Actionsheet.Content>
    </Actionsheet>
  )
}

///////////////////////////////////////////////
///////////////////////////////////////////////
function BattleModal(props){  

  return(
    <Modal isOpen={props.openBattleModal}>
      <Modal.Content>
        <Modal.Header>Battle</Modal.Header>
        <Modal.Body>Hello</Modal.Body>
      </Modal.Content>
    </Modal>
  )
}

///////////////////////////////////////////////
///////////////////////////////////////////////
function UserInput(props){
  return (
    <Input
      selectTextOnFocus=  {true}
      width=              "100%"
      bg=                 "white"
      onSubmitEditing=    {(evt)=> props.process_user_input(evt.nativeEvent.text)}
    />
  )
  
}

//-- Game Commands

///////////////////////////////////////////////
function cmd_look(target=null){

  let current_room = World.get(World.get(player_id).current_room_id);

  if (target===null || target===current_room.name.toLowerCase()){
    add_chat_item('look_room', {room_id: current_room.id});
  } else {
    
    let target_found = false;
    for (const entity_id of current_room.entities){              
      if (target===World.get(entity_id).name.toLowerCase()){        
        target_found = true;
        add_chat_item('look_entity', {entity_id: entity_id});
        break;
      }
    }

    if (!target_found){
      add_chat_item('generic_message', {text: `There's no ${target} around.`});
    }
  }
}

///////////////////////////////////////////////
function cmd_move(cmd){

  let current_room= World.get(World.get(player_id).current_room_id);
  let next_room_id= current_room.exits[cmd];

  if (next_room_id===null){
    add_chat_item('generic_message', {text: `There's no exit ${cmd}.`});
  } else {
    World.get(player_id).current_room_id = next_room_id;
    current_room.remove_entity(player_id);
    World.get(next_room_id).add_entity(player_id);

    cmd_look();
  }

}

///////////////////////////////////////////////
///////////////////////////////////////////////
///////////////////////////////////////////////
export default function App() {    

  const [openCmdActnSht, setOpenCmdActnSht] = useState(false);
  const [infobarText,    setInfobarText]    = useState("Text");
  const [cmdActnSht_Content, setCmdActnSht_Content] = useState([]);

  //------------------------------
  function link_handler(type, entity_id){

    let commands_array;
    
    switch(type){
      case "room":
        commands_array = ['Look'];        
        break;

      case "player":
        commands_array = ['Look'];        
        break;
    }

    let key     = 0;
    let content = [];

    for (const cmd of commands_array){

      let text = cmd + ` ${World.get(entity_id).name}`;
      key      = key+1;

      content.push(
        <Actionsheet.Item 
          key={key.toString()}
          onPress={()=>{
            setOpenCmdActnSht(false);
            process_user_input(text);
          }}
        >
          {text}
        </Actionsheet.Item>);
    }    

    setCmdActnSht_Content(content);
    setOpenCmdActnSht(true);
  }
  
  //------------------------------
  function process_user_input(text){

    add_chat_item('user_text', {content: text});

    let [cmd, target] = parse_user_input(text);

    switch(cmd){
      case("look"):
        cmd_look(target);
        break;

      case('north'):
      case('south'):
      case('west'):
      case('east'):
      case('up'):
      case('down'):
        cmd_move(cmd);
        break;
    }
  }
  
  return (
    <NativeBaseProvider>

      <Box style={styles.container} safeArea>
        <ChatArea chat_data={chat_data} link_handler={link_handler}/>
        <InfoBar text={infobarText}/>        
        <UserInput process_user_input={process_user_input}/>
      </Box>

      <CommandsActionsheet openCmdActnSht={openCmdActnSht} content={cmdActnSht_Content}/>
      <BattleModal />
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