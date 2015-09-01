#pragma strict

@System.NonSerialized
var dwarves : Array = new Array();
var dungeon : Dungeon = null;
var speed = 20;

function Start () {
}

function Update ()
{
	for (var dwarf : Dwarf in dwarves)
	{
		dwarf.Step();
	}
}

/**
* Add a new dwarf to the team
*/
public function Add(plan : DungeonPlan) : Dwarf
{
	var dwarf : Dwarf = new Dwarf();	
	dwarf
		.Speed(speed)
		.UsePlan(plan)
		.Enter(dungeon);

	dwarves.Push(dwarf);
}



