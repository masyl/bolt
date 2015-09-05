using UnityEngine;
using System.Collections;

public class SpriteMaskExample06 : MonoBehaviour
{
	public SpriteMask mask1;
	public SpriteMask mask2;

	void OnGUI ()
	{
		if (GUI.Button (new Rect (10, 10, 150, 50), mask1.enabled ? "Outer mask OFF" : "Outer mask ON")) {
			mask1.enabled = !mask1.enabled;
		}
		if (GUI.Button (new Rect (10, 70, 150, 50), mask2.enabled ? "Inner mask OFF" : "Inner mask ON")) {
			mask2.enabled = !mask2.enabled;
		}
	}
}
