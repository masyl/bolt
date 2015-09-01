#pragma strict

public class Door
{
	public var destination : Room = null;
	
	public function Door(room : Room)
	{
		destination = room;
	}
}
