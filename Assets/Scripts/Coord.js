#pragma strict

public class Coord
{
	public var x : int = 0;
	public var y : int = 0;	

	public function Coord (x : int, y: int)
	{
		this.x = x;
		this.y = y;
	}
	public function Coord (coord : Coord)
	{
		this.x = coord.x;
		this.y = coord.y;
	}
	public function equals(coord: Coord) : boolean
	{
//		Debug.Log(address() + " == " + coord.address());
		return (this.x == coord.x && this.y == coord.y);
	}
	// Return a string address like this:  @4:5
	public function address() : String
	{
		return "@" + x + ":" + y;
	}

	public function Move(direction: Direction, steps : int) : Coord {
		switch (direction.dir())
		{
		case 0:
			y = y + steps;
			break;
		case 1:
			x = x + steps;
			break;
		case 2:
			y = y - steps;
			break;
		case 3:
			x = x - steps;
			break;
		}
		return this;
	}

}

