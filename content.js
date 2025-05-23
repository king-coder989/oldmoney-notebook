// Content script to enhance drag and drop functionality

// Improve text selection and dragging experience
document.addEventListener('dragstart', (e) => {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  
  if (selectedText) {
    // Set drag data
    e.dataTransfer.setData('text/plain', selectedText);
    e.dataTransfer.effectAllowed = 'copy';
    
    // Add visual feedback
    const dragElement = document.createElement('div');
    dragElement.style.cssText = `
      position: absolute;
      top: -1000px;
      background: rgba(139, 115, 85, 0.1);
      padding: 8px 12px;
      border-radius: 4px;
      border: 1px solid rgba(139, 115, 85, 0.3);
      font-family: Georgia, serif;
      font-size: 14px;
      color: #2c2416;
      max-width: 200px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      backdrop-filter: blur(10px);
    `;
    dragElement.textContent = selectedText.length > 30 ? 
      selectedText.substring(0, 30) + '...' : selectedText;
    
    document.body.appendChild(dragElement);
    e.dataTransfer.setDragImage(dragElement, 20, 20);
    
    // Clean up drag element
    setTimeout(() => {
      document.body.removeChild(dragElement);
    }, 0);
  }
});

// Enhance text selection for better dragging
document.addEventListener('mouseup', (e) => {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  
  if (selectedText && selectedText.length > 0) {
    // Add subtle visual cue that text can be dragged
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.cssText = `
      background: rgba(139, 115, 85, 0.1);
      transition: background 0.3s ease;
      cursor: grab;
    `;
    
    try {
      range.surroundContents(span);
      
      // Make the selection draggable
      span.draggable = true;
      
      // Remove styling after a delay
      setTimeout(() => {
        if (span.parentNode) {
          span.outerHTML = span.innerHTML;
        }
      }, 2000);
    } catch (e) {
      // Handle cases where range can't be surrounded
      console.log('Could not enhance selection for dragging');
    }
  }
});

// Keyboard shortcut to open side panel
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'N') {
    e.preventDefault();
    chrome.runtime.sendMessage({ action: 'openSidePanel' });
  }
});
