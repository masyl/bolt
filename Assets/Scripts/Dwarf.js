#pragma strict

/**
 * Agent that will roam the dungeon and build rooms
 */
 
public class Dwarf
{
	@System.NonSerialized
	public var room : Room = null;

	public var dungeon : Dungeon = null;
	public var speed : float = 0;
	public var dungeonPlan : DungeonPlan = null;
	var lastStepTime : long = 0;
	public var workStepCount : int = 0;
	public var isWorking : boolean = true;

	public var direction : Direction = new Direction();

	public function Dwarf ()
	{
//		Debug.Log("Dwarf: Hi there, I'm your dwarf!");
	}
	
	public function Step ()
	{
		if (!this.isWorking) return this;
		if (workStepCount > dungeonPlan.maxWorkSteps)
		{
			this.isWorking = false;
			Debug.Log("Dwarf: Reached my work step limit! Break time!!!");
			return this;
		}
		if (this.dungeon.roomCount() >= dungeonPlan.maxRoomCount)
		{
			this.isWorking = false;
			Debug.Log("Dwarf: Reached maximum room count!!! I'm done!");
			return this;
		}
		
		// Control the speed at which the Dwarf works
		if (System.DateTime.Now.Ticks > lastStepTime + speed)
		{
			NextWorkItem();
			lastStepTime = System.DateTime.Now.Ticks;
		}
		return this;
	}
	
	public function Speed (milliseconds : float)
	{
		this.speed = milliseconds * 1000;
		return this;
	}

	public function NextWorkItem ()
	{
		workStepCount++;
//		Debug.Log("Dwarf: working... doodeedoo");
		this.direction.RandomTurn(3);
		this.Dig();
		return this;
	}
	
	public function Dig () : Dwarf
	{
		var coord : Coord = new Coord(this.room.coord);
		coord.Move(this.direction, 1);
		var existingRoom = dungeon.getRoom(coord);
		if (existingRoom == null)
		{
			// If the coordinate if free, dig a new room
			var room : Room = new Room(coord);
			dungeon.AddRoom(room);
			this.room.OpenDoorTo(room);
			room.OpenDoorTo(this.room);

			room.touch();
			this.room.touch();

			this.room = room;
			Debug.Log("Dwarf: Dug a new room in " + room.coord.address());  
		} else {
			Debug.Log("Dwarf: Room already exists, moving along to " + existingRoom.coord.address());  
			// If room already exists at this coordinate, move into that room
			this.room.OpenDoorTo(existingRoom);
			existingRoom.OpenDoorTo(this.room);
			existingRoom.touch();
			this.room.touch();
			this.room = existingRoom;
		}
		return this;
	}
		
	public function UsePlan (dungeonPlan : DungeonPlan)
	{
		Debug.Log("Dwarf: got the plan!");
		this.dungeonPlan = dungeonPlan;
		return this;
	}
	
	public function Enter (dungeon : Dungeon)
	{
		this.dungeon = dungeon;
		if (dungeon != null) {
			
			if (this.dungeon.entrance == null)
			{
				Debug.Log("Dwarf: Can't find dungeon entrance!");
				CreateFirstRoom(); //
			}
			this.room = this.dungeon.entrance;
			Debug.Log("Dwarf: Entered dungeon at " + this.room.coord.address());
		}
		else
		{
			Debug.Log("Dwarf: Sorry... no dungeon!");
		}
		return this;
	}
	
	public function CreateFirstRoom ()
	{
		if (this.dungeon != null && this.dungeon.entrance == null)
		{
			var room = new Room(new Coord(0, 0));
			this.dungeon.entrance = room;
			this.dungeon.AddRoom(room);
			Debug.Log("Dwarf: Created the dungeon entrance!");
		}
		else
		{
			Debug.Log("Dwarf: Can't create first room, it already exists!");
		}
		return this;
	}

}

public class DungeonPlan {
	public var maxRoomCount : int = 1;
	public var maxWorkSteps : int = 1000;
}



