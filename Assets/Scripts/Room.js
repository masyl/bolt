#pragma strict

public class Room
{
	public var coord : Coord = null;
	public var doors : Array = [];
	@System.NonSerialized
	public var dungeon : Dungeon = null;
	
	public function Room (coord : Coord)
	{
		this.coord = new Coord(coord);
		// todo: broadcast roomCreated message
	}
	
	public function touch ()
	{
		dungeon.onRoomUpdate(this);
	}
	
	public function OpenDoorTo (room : Room) : Door
	{
		var door : Door = findDoorToRoom(room);
		if (door != null) return door;
		door = new Door(room);
		this.doors.Push(door);
		Debug.Log("Dungeon: Door openned from " + this.coord.address() + " to " + room.coord.address() + " for a total of " + this.doors.length);
		return door;
	}

	public function findDoorToRoom(room : Room) : Door
	{
		for (var door:Door in doors)
		{
			if (door.destination == room) return door;
		}
		return null;
	}

	public function findDoorInDirection(dir : Direction) : Door
	{
		var door : Door = null;
		var coord = new Coord(this.coord);
		coord.Move(dir, 1);
		Debug.Log("Looking for door from: " + this.coord.address() +  " to " + coord.address());
		var room = dungeon.getRoom(coord);
		if (room != null) door = this.findDoorToRoom(room);
		return door;
	}
	
	public function getDoorsSignature() : String
	{
		var signature = "";
		var door : Door;
		var dir = new Direction(0);
		door = findDoorInDirection(dir);
		if (door!=null) {
			signature = signature + "1";
		} else {
			signature = signature + "0";
		}

		dir.Right();
		door = findDoorInDirection(dir);
		if (door!=null) {
			signature = signature + "1";
		} else {
			signature = signature + "0";
		}

		dir.Right();
		door = findDoorInDirection(dir);
		if (door!=null) {
			signature = signature + "1";
		} else {
			signature = signature + "0";
		}

		dir.Right();
		door = findDoorInDirection(dir);
		if (door!=null) {
			signature = signature + "1";
		} else {
			signature = signature + "0";
		}
		
		return signature;
	}
	
}

public class Door
{
	public var destination : Room = null;
	
	public function Door(room : Room)
	{
		destination = room;
	}
}

