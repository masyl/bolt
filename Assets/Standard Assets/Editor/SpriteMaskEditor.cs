//----------------------------------------------
//                 SpriteMask
//          Copyright © 2015 TrueSoft
//             support@truesoft.pl
//----------------------------------------------
using System;
using UnityEngine;
using UnityEditor;
using UnityEditorInternal;
using System.Reflection;

[CustomEditor(typeof(SpriteMask))]
public class SpriteMaskEditor : Editor
{
	private int lastSortingParamsGetFrame;
	private string[] sortingLayerNames;
	private int[] sortingLayerUniqueIDs;

	public override void OnInspectorGUI ()
	{
		SpriteMask mask = (SpriteMask)target;

		bool isPrefab = PrefabUtility.GetPrefabType (mask) == PrefabType.Prefab;
		if (isPrefab) {
			EditorGUILayout.HelpBox ("Prefab edit unavailable", MessageType.Info);
			return;
		}

		if (Event.current.type == EventType.ValidateCommand && Event.current.commandName == "UndoRedoPerformed") {
			// Apply undo
			mask.SendMessage ("RequestTypeApply", SendMessageOptions.DontRequireReceiver);
		}

		GUILayoutOption[] options = new GUILayoutOption[0];

		serializedObject.Update ();

		SpriteMask.Type currentType = mask.type;
		SpriteMask.Type newType = (SpriteMask.Type)EditorGUILayout.EnumPopup ("Type", currentType, options);

		if (GUI.changed) {
			if (currentType != newType) {
				Undo.RecordObject (target, "Type change");
				mask.type = newType;
				mask.SendMessage ("RequestTypeApply", SendMessageOptions.DontRequireReceiver);
				EditorUtility.SetDirty (target);
			}
		}

		Vector2 currentSize = mask.size;
		Vector2 newSize = currentSize;

		Vector2 currentPivot = mask.pivot;
		Vector2 newPivot = currentPivot;
		
		Sprite currentSprite = mask.sprite;
		Sprite newSprite = currentSprite;
		
		Texture2D currentTexture = mask.texture;
		Texture2D newTexture = currentTexture;

		switch (newType) {
		case SpriteMask.Type.Sprite:
			newSprite = EditorGUILayout.ObjectField ("Sprite", currentSprite, typeof(Sprite), true, options) as Sprite;
			break;
		case SpriteMask.Type.Rectangle:
		case SpriteMask.Type.Texture:
			if (newType == SpriteMask.Type.Texture) {
				newTexture = EditorGUILayout.ObjectField ("Texture", currentTexture, typeof(Texture2D), true, options) as Texture2D;
			} 
			newSize = EditorGUILayout.Vector2Field ("Size", currentSize, options);
			newPivot = EditorGUILayout.Vector2Field ("Pivot", currentPivot, options);
			break;
		}

		if (GUI.changed) {
			if (currentSize != newSize) {
				Undo.RecordObject (target, "Size change");
				mask.size = newSize;
				EditorUtility.SetDirty (target);
			}

			if (currentPivot != newPivot) {
				Undo.RecordObject (target, "Pivot change");
				mask.pivot = newPivot;
				EditorUtility.SetDirty (target);
			}
			
			if (currentSprite != newSprite) {
				Undo.RecordObject (target, "Sprite change");
				mask.sprite = newSprite;
				EditorUtility.SetDirty (target);
			}
			
			if (currentTexture != newTexture) {
				Undo.RecordObject (target, "Texture change");
				mask.texture = newTexture;
				EditorUtility.SetDirty (target);
			}
		}

		if (newType == SpriteMask.Type.Rectangle || newType == SpriteMask.Type.Texture) {
			EditorGUILayout.Space ();

			Renderer r = mask.GetComponent <Renderer> ();
			if (r != null) {
				maybeGetSortingParams ();

				int selectedIdx = -1;
				string name = r.sortingLayerName;

				for (int i = 0; i < sortingLayerNames.Length; i++) {
					if (name.Equals (sortingLayerNames [i])) {
						selectedIdx = i;
					}
				}

				if (selectedIdx == -1) {
					for (int i = 0; i < sortingLayerUniqueIDs.Length; i++) {
						if (sortingLayerUniqueIDs [i] == 0) {
							selectedIdx = i;
						}
					}
				}

				int sortingLayerIdx = EditorGUILayout.Popup ("Sorting Layer", selectedIdx, sortingLayerNames);
				if (selectedIdx != sortingLayerIdx) {
					Undo.RecordObject (r, "Sorting Layer change");
					r.sortingLayerName = sortingLayerNames [sortingLayerIdx];
					EditorUtility.SetDirty (r);
				}

				int sortingOrder = EditorGUILayout.IntField ("Order in Layer", r.sortingOrder, options);
				if (sortingOrder != r.sortingOrder) {
					Undo.RecordObject (r, "Order in Layer");
					r.sortingOrder = sortingOrder;
					EditorUtility.SetDirty (r);
				}
			}
		}

		string msg = string.Concat ("Instance ID: ", mask.GetInstanceID (), 
		                            "\nStencil ID: ", mask.stencilId, 
		                            " (level=", mask.level, 
		                            ", id=" + mask.maskIdPerLevel,
		                            ")");
		EditorGUILayout.HelpBox (msg, MessageType.None);
	}

	private void maybeGetSortingParams ()
	{
		if (Time.frameCount != lastSortingParamsGetFrame || sortingLayerNames == null || sortingLayerUniqueIDs == null) {
			lastSortingParamsGetFrame = Time.frameCount;

			Type internalEditorUtilityType = typeof(InternalEditorUtility);

			PropertyInfo sortingLayersProperty = internalEditorUtilityType.GetProperty ("sortingLayerNames", BindingFlags.Static | BindingFlags.NonPublic);
			sortingLayerNames = (string[])sortingLayersProperty.GetValue (null, new object[0]);

			PropertyInfo sortingLayerUniqueIDsProperty = internalEditorUtilityType.GetProperty ("sortingLayerUniqueIDs", BindingFlags.Static | BindingFlags.NonPublic);
			sortingLayerUniqueIDs = (int[])sortingLayerUniqueIDsProperty.GetValue (null, new object[0]);
		}
	}
}