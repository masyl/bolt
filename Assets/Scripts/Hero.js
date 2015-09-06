#pragma strict

/**
 * Agent that will roam the dungeon and build rooms
 */
 
public class Hero
{
	@System.NonSerialized
	public var room : Room = null;

	public var dungeon : Dungeon = null;
	public var speed : float = 0;
	var lastStepTime : long = 0;
	public var isPlaying : boolean = true;

	public var direction : Direction = new Direction();

	public function Hero ()
	{
//		Debug.Log("Dwarf: Hi there, I'm your dwarf!");
	}
	
	public function Step ()
	{
		if (!this.isPlaying) return this;
		
		// Control the speed at which the Hero can move
		if (System.DateTime.Now.Ticks > lastStepTime + speed)
		{
			NextActionItem();
			lastStepTime = System.DateTime.Now.Ticks;
		}
		return this;
	}
	
	public function Speed (milliseconds : float)
	{
		this.speed = milliseconds * 1000;
		return this;
	}

	public function NextActionItem ()
	{
		//todo: Move thoward next room if possible
		return this;
	}

	public function Enter (dungeon : Dungeon)
	{
		this.dungeon = dungeon;
		if (dungeon != null) {			
			if (this.dungeon.entrance == null)
			{
				Debug.Log("Hero: Can't find dungeon entrance!");
			}
			Debug.Log("Hero: Entered dungeon at " + this.room.coord.address());
		}
		else
		{
			Debug.Log("Hero: Sorry... no dungeon!");
		}
		return this;
	}
	
}



