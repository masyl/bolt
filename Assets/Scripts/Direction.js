#pragma strict


public class Direction
{
	var direction : int = 0;

	public function Reverse () : Direction
	{
		if (direction == 0)
		{
			direction = 2;
		}
		else if (direction == 1)
		{
			direction = 3;
		}
		else if (direction == 2)
		{
			direction = 0;
		}
		else if (direction == 3)
		{
			direction = 1;
		};
		return this;
	}
	public function Left () : Direction
	{
		direction--;
		if (direction < 0) direction = 3;
		return this;
	}
	public function Right () : Direction
	{
		direction++;		
		if (direction > 3) direction = 0;
		return this;
	}
	public function dir () : int {
		return direction;
	}

	public function RandomTurn(chancesNotToTurn : int) {
		switch (Random.Range(0, 3 + chancesNotToTurn))
		{
		case 0:
			Reverse();
			break;

		case 1:
			Left();
			break;
		
		case 2:
			Right();
			break;
		}
	}

}
