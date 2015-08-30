/**
 * A special case list implementation with useful performance characteristics
 * over Array() and ArrayList() in some circumstances. A compact list cannot
 * hold null references and elements can only be accessed sequentially and
 * in an all or nothing matter. Also the capacity of the native array used
 * to hold list elements may increase as length increases but it will never
 * decrease as length decreases.
 *
 * @author Fernando Zapata (fernando@cpudreams.com)
 */
class CompactList {
  /**
   * Read only. Number of elemnts in a compact list. Not guaranteed to be up
   * to date while Iterate is in process.
   */
  var length : int;
  private var data : Object[];
  private var capacity : int;
  private var growthRate : float;
 
  /**
   * Set the starting capacity of the array used to store the CompactList's
   * elements. When Add is called and the internal array is at capacity
   * a new array of size Mathf.CeilToInt(capacity * growthRate) is allocated.
   * Growth rate must be greater than 1.0.
   */
  function CompactList(startingCapacity : int, growthRate : float) {
    if (growthRate <= 1.0) {
      Debug.LogError("Invalid CompactList growthRate, must be > 1.0");
    }
    data = new Object[startingCapacity];
    capacity = startingCapacity;
    this.growthRate = growthRate;
    length = 0;
  }
 
  /**
   * Adds object to the end of the list. The object cannot be null.
   */
  function Add(o : Object) {
    if (!o) {
      Debug.LogError("Cannot add null reference to CompactList");
    }
 
    if (length == capacity) {
      // allocate new larger array and copy elements from old array
      capacity = Mathf.CeilToInt(capacity * growthRate);
      var newData = new Object[capacity];
      for (var i = 0; i < length; i++) {
        newData[i] = data[i];
      }
      data = newData;
    }
    data[length] = o;
    length++;
  }
 
  /**
   * Iterates through each element in the list in the order they where added
   * to the list and calls the process function once for each element.
   * The current element is passed as the first parameter of the function.
   * The process function should return true if the processed element should be
   * removed from this CompactList. Returning true from the process function
   * is the only method of removing elements from a compact list.
   */
  function Iterate(process : Function) {
    var nullIndex = -1;
    for (var i = 0; i < length; i++) {
      var o = data[i];
      if (process(o)) {
        // remove current element
        data[i] = null;
        if (nullIndex == -1) {
          nullIndex = i;
        }
      } else {
        // move current element in order to compact the array
        if (nullIndex != -1) {
          data[nullIndex] = o;
          data[i] = null;
          // since elements are removed in order the next nullIndex is always
          // nullIndex + 1
          nullIndex++;
        }
      }
    }
    if (nullIndex != -1) {
      length = nullIndex;
    }
  }
}
