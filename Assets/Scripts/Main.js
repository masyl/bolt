#pragma strict

/*

Consider using MessageRouter http://wiki.unity3d.com/index.php/MessageRouter
*/
Debug.Log("Main started!");
var dungeon : Dungeon = null;	
var dwarf : Dwarf = null;
var dwarf2 : Dwarf = null;
var dwarf3 : Dwarf = null;

var MinimapRoom : GameObject;

function Start ()
{

	//	GameObject.Find("soundtrack").GetComponent(AudioSource).Play();
	Debug.Log("START!");
	dungeon = new Dungeon();	
	dwarf = new Dwarf();
	dwarf2 = new Dwarf();
	dwarf3 = new Dwarf();

	dungeon.onRoomCreate(onRoomCreated); // Register room creation handler
	dungeon.onRoomUpdate(onRoomUpdated); // Register room update handler

	var dungeonPlan : DungeonPlan = new DungeonPlan();
	dungeonPlan.maxRoomCount = 200;

	dwarf
		.Speed(20)
		.UsePlan(dungeonPlan)
		.Enter(this.dungeon);

	dwarf2
		.Speed(20)
		.UsePlan(dungeonPlan)
		.Enter(this.dungeon);

	dwarf3
		.Speed(20)
		.UsePlan(dungeonPlan)
		.Enter(this.dungeon);
		
		
}

function Update ()
{
	dwarf.Step();
	dwarf2.Step();
	dwarf3.Step();
}

function onRoomUpdated(room : Room)
{
	// Debug.Log("Room updated " + room.coord.address());
	// todo: Update minimap
	
}
function onRoomCreated(room : Room)
{
//	var roomSprite : GameObject = new GameObject();
//	roomSprite.name = "room:" + room.address();
//	roomSprite.AddComponent(SpriteRenderer);
//	var uiRenderer = roomSprite.GetComponent(SpriteRenderer);
//	var uiTexture = Resources.Load("???", Texture2D);
//	var uiSprite = Sprite.Create(uiTexture, Rect(0f, 0f, 48f, 48f), new Vector2(0f, 0f), 128f);
//	uiRenderer.sprite = uiSprite;

	var roomID = "room:" + room.coord.address();
	var roomSprite : GameObject = Instantiate(MinimapRoom);
	roomSprite.name = roomID;
	var scale : float = 2;
	roomSprite.transform.position.x = parseFloat(room.coord.x) / scale;
	roomSprite.transform.position.y = parseFloat(room.coord.y) / scale;
	Debug.Log("UI : Adding sprite : " + roomID);
}

function DrawRoom(room : Room)
{
}







