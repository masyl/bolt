#pragma strict

/*

Consider using MessageRouter http://wiki.unity3d.com/index.php/MessageRouter
*/
var dungeon : Dungeon;
var dwarfTeam : DwarfTeam;
var minimap : Minimap;
var rooms : Rooms;

function Start ()
{
	Debug.Log("Main Start!");

	// Bind the dungeon to the minimap events
	// todo : Better way ?
	dungeon.onRoomCreate(OnRoomCreated); // Register room creation handler
	dungeon.onRoomUpdate(OnRoomUpdated); // Register room update handler

	// Create the dungeon plans
	var plan : DungeonPlan = new DungeonPlan();
	plan.maxRoomCount = 220;

	// Add a dwarf to the team!
	dwarfTeam.Add(plan);
	dwarfTeam.Add(plan);
	dwarfTeam.Add(plan);
	dwarfTeam.Add(plan);
	dwarfTeam.Add(plan);
	dwarfTeam.Add(plan);

}

function OnRoomCreated(room : Room)
{
	minimap.onRoomCreated(room);
	rooms.onRoomCreated(room);

}

function OnRoomUpdated(room : Room)
{
	minimap.onRoomUpdated(room);
	rooms.onRoomUpdated(room);

}


function Update ()
{
	if (Input.GetKeyUp(KeyCode.Escape)) ResetDungeon();
}

function ResetDungeon ()
{
	Debug.Log("ResetDungeon!!!");
}






