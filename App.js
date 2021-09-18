import React, {useState, useRef}                    from 'react';
import { StyleSheet }                               from 'react-native';
import {Box, NativeBaseProvider, Input, FlatList }  from 'native-base';
import {Link, Actionsheet, Text, Modal }            from 'native-base';

/* 
Design conventions:
- every string is converted to lower case before comparison.
- Type system: room is 'entity', under it are all the rest.

*/

//-- Entities Classes

//////////////////////////////
//////////////////////////////
class Room {
  constructor(){
    this.id           = get_new_id();
    this.type         = "entity.room";
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
    World.set(this.id, this);
  }

  set_name(name){
    this.name = name;
  }

  set_description(description){
    this.description = description;
  }

  add_exit(direction, next_room_id){
    this.exits[direction] = next_room_id;
    let opposite_exit_direction;

    switch(direction){
      case 'north':
        opposite_exit_direction = 'south';
        break;

      case 'south':
      opposite_exit_direction = 'north';
      break;

      case 'east':
        opposite_exit_direction = 'west';
        break;

      case 'west':
        opposite_exit_direction = 'east';
        break;

      case 'up':
        opposite_exit_direction = 'down';
        break;

      case 'down':
        opposite_exit_direction = 'up';
        break;
    }

    World.get(next_room_id).exits[opposite_exit_direction] = this.id;
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
    World.get(entity_id).current_room_id = this.id;
  }

  remove_entity(entity_id){
    let ix = this.entities.indexOf(entity_id);
    if (ix!==-1){
      this.entities.splice(ix,1);
    }
  }

  process_tick(){
    return [null, null];
  }
}

//////////////////////////////
//////////////////////////////
class Player {
  constructor(){
    this.type=              'entity.player';
    this.id=                get_new_id();
    this.name=              'Player';
    this.description=       "It's you, bozo.";
    this.hp=                100;
    this.damage=            1;
    this.fighting_with_id=  null;
    this.current_room_id=   null;
    World.set(this.id, this);
  }

  process_tick(){
    return [null, null];
  }
}

class NPC {
  constructor(){
    this.type=              'entity.npc';
    this.id=                get_new_id();
    this.name=              'NPC';
    this.description=       "It's an NPC.";
    this.hp=                100;
    this.damage=            1;
    this.current_room_id=   null;
    this.fighting_with_id=  null;
    World.set(this.id, this);
  }

  set_name(name){
    this.name = name;
  }

  set_description(description){
    this.description = description;
  }

  process_tick(){
    return [null, null];
  }
}

class Dog extends NPC {
  constructor(){
    super();
    this.tick_counter= 0;
  }

  process_tick(){
    //once every 10 tick - bark. 
    this.tick_counter += 1;
    if (this.tick_counter % 10===0){
      let template = "generic_message";
      let data     = {content: "Archie barks and wags his tale."};
      return [template, data];
    } else {
      return [null, null];
    }

  }
}

//-- Game Setup

let   current_id=           0; //IDs are of type Number.
const World=                new Map();
let   player_id=            null;

init_world();

///////////////////////////////////////////////
///////////////////////////////////////////////
function init_world(){

  let room= new Room();
  room.set_name("Room 1");
  room.set_description("This is the starting room of the game.");
  
  let dog= new Dog();
  dog.set_name('Archie');
  dog.set_description("It's a pretty, but quite stupid, dog.");
  room.add_entity(dog.id);  

  let room2= new Room();
  room2.set_name("Room 2");
  room2.set_description("This is the 2nd room of the game.");
  room2.add_exit('south', room.id);
  
    let player = new Player();  
  room.add_entity(player.id);
  
  player_id = player.id;  
}

//-- Utitility Functions

//////////////////////////////
//////////////////////////////
function get_new_id(){
  current_id = current_id+1;  
  return current_id.toString();
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
function ChatArea(props){
  
  const ChatAreaRef                   = useRef();

  //--------------------------------------- -------------------
  function renderItem({item}){
    
    return (
      <Box>
        {item.content}
      </Box>      
    )
 
  };
  //----------------------------------------------------------

  return (
    <FlatList 
      ref={ChatAreaRef}
      onContentSizeChange={()=> ChatAreaRef.current.scrollToEnd()}
      extraData=    {props}
      data=         {props.chatData}
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


///////////////////////////////////////////////
///////////////////////////////////////////////
///////////////////////////////////////////////
export default function App() {    

  const [openCmdActnSht, setOpenCmdActnSht]         = useState(false);
  const [infobarText,    setInfobarText]            = useState("Text");
  const [cmdActnSht_Content, setCmdActnSht_Content] = useState([]);  
  
  const [chatData,    setChatData]                  = useState([
    { id:       get_new_id(),
      template: 'look_room',
      content:  generate_look_room_chat_item_content({room_id: '1'})
    }
  ]);

  setInterval(()=>{
    game_loop();
  },1000);

  function game_loop(){
    
    World.forEach((entity, id)=>{
      console.log(entity.name);
    })

    // for (const [id, entity] of World){
      // console.log(entity);
      // let [template, data] = entity.process_tick();
      // add_chat_item(template, data);
  }  

  //-- Aux functions

  function generate_look_room_chat_item_content(data){

    let room = World.get(data.room_id);
    return (   
      <Box 
        style=                  {styles.chat_box_system} 
        borderRadius=           "10px" 
        borderBottomLeftRadius= "0px"
        borderColor=            "primary.600"
        borderWidth=            "3px"
      >
        <Text 
          underline 
          color=      "blue.500"                     
          fontSize=   "xl"
          onPress=    {()=> link_handler('entity.room', {room_id:data.room_id})}
        >
          {room.name}
        </Text>
        <Text>{room.description}</Text>
  
        <Text>Exits:</Text>
        {room.get_exits().map((direction)=> 
          <Text 
            key={direction}
            underline 
            color=      "blue.500"                     
            fontSize=   "xl"
            onPress=    {()=> link_handler('cmd',{direction: direction})}
          >
            {direction}
          </Text>
        )}
  
        <Text>In the room:</Text>
        {(room.entities.length===0) ? 
          "The room is empty." : 
          (room.entities.map((entity_id)=>
            <Text
              underline 
              key={entity_id}
              color=    "blue.500"                     
              fontSize= "xl"
              onPress=  {()=> 
                link_handler(World.get(entity_id).type, {entity_id:entity_id})
              }
            >
              {World.get(entity_id).name}
            </Text>)
        )}
      </Box>
    )
  }

  function generate_look_player_chat_item_content(data){
    let entity = World.get(data.entity_id);
    return (
      <Box 
        style=                  {styles.chat_box_system} 
        borderRadius=           "10px" 
        borderBottomLeftRadius= "0px"
        borderColor=            "primary.600"
        borderWidth=            "3px"
      >
        <Text
          underline 
          color=      "blue.500"                     
          fontSize=   "xl"
          onPress=    {()=> link_handler('entity.player', {entity_id:data.entity_id})}
        >
          {entity.name}
        </Text>
        <Text>
        {entity.description}
        </Text>         
      </Box>
    )
  }

  function generate_look_npc_chat_item_content(data){
    let entity = World.get(data.entity_id);
    return (
      <Box 
        style=                  {styles.chat_box_system} 
        borderRadius=           "10px" 
        borderBottomLeftRadius= "0px"
        borderColor=            "primary.600"
        borderWidth=            "3px"
      >
        <Text
          underline 
          color=      "blue.500"                     
          fontSize=   "xl"
          onPress=    {()=> link_handler('entity.npc', {entity_id:data.entity_id})}
        >
          {entity.name}
        </Text>
        <Text>
        {entity.description}
        </Text>         
      </Box>
    )
  }

  function generate_generic_message_chat_item_content(data){
    return (
      <Box 
        style=                  {styles.chat_box_system} 
        borderRadius=           "10px" 
        borderBottomLeftRadius= "0px"
        borderColor=            "primary.600"
        borderWidth=            "3px"
      >
        <Text>{data.content}</Text>
      </Box>
    )
  }

  function generate_user_text_chat_item_content(data){
    return (
      <Box 
        style=                  {styles.chat_box_user} 
        borderRadius=           "10px" 
        borderBottomRightRadius="0px"
        borderColor=            "red.500"
        borderWidth=            "2px"
        >
        <Text>{data.content}</Text>
      </Box>
    )
  }

   ///////////////////////////////////////////////
   function add_chat_item(template, data){
    //get data and converts it to a chat item format.
    
    let content;
    if (template===null){
      return;
    } else if (template==="look_room"){      
      content = generate_look_room_chat_item_content(data);
    } else if (template==="look_player"){
      content= generate_look_player_chat_item_content(data) 
    } else if (template==="generic_message"){      
      content = generate_generic_message_chat_item_content(data);      
    }  else if (template==="user_text"){
      content = generate_user_text_chat_item_content(data);      
    } else if (template==="look_npc"){
      content = generate_look_npc_chat_item_content(data);      
    }

    let new_chat_item = {
      id:       get_new_id(),
      template: template,
      content:  content
    };
    
    setChatData((chatData => [...chatData, new_chat_item]));
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
          if (World.get(entity_id).type==="entity.player"){
            add_chat_item('look_player', {entity_id: entity_id});          
          } else if (World.get(entity_id).type==="entity.npc"){
            add_chat_item('look_npc', {entity_id: entity_id});          
          }
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
      add_chat_item('generic_message', {content: `There's no exit ${cmd}.`});
    } else {
      World.get(player_id).current_room_id = next_room_id;
      current_room.remove_entity(player_id);
      World.get(next_room_id).add_entity(player_id);

      cmd_look();
    }

  }

  //------------------------------
  function link_handler(type, options){    
    let commands_array;
    let target;    

    if (type==='cmd'){
      add_chat_item('user_text', {content: options.direction});
      cmd_move(options.direction);
      return;
    }
    
    switch(type){
      case "entity.room":
        commands_array= ['Look'];
        target=         World.get(options.room_id).name;
        break;

      case "entity.npc":
        commands_array= ['Look'];
        target=         World.get(options.entity_id).name;
        break;

      case "entity.player":
        commands_array= ['Look'];
        target=         World.get(options.entity_id).name;
        break;
    }
    
    let content = [];
    for (const cmd of commands_array){

      let text = cmd + ` ${target}`;

      content.push(
        <Actionsheet.Item 
          key={get_new_id()}
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

      <Box          style={styles.container} safeArea>
        <ChatArea   chatData={chatData} link_handler={link_handler}/>
        <InfoBar    text={infobarText}/>        
        <UserInput  process_user_input={process_user_input}/>
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