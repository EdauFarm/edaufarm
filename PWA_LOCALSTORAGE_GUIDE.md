# localStorage Guide for PWA Tutorial

## Overview
The PWA Tutorial system uses browser localStorage to track whether users have been guided through the installation process.

---

## 🔑 localStorage Keys

### Primary Key: `gadgetworld-tutorial-guided`

**Purpose**: Tracks tutorial completion status

**Possible Values**:
- `null` / `undefined` → User has never seen the tutorial (NEW USER)
- `'true'` → User completed the full tutorial
- `'skipped'` → User skipped or closed the tutorial

**Type**: String (not boolean - stored as `'true'` string)

---

### Secondary Key: `gadgetworld-tutorial-completed-date`

**Purpose**: Records when the tutorial was completed or skipped

**Value**: ISO 8601 timestamp string

**Example**: `"2026-02-04T10:30:45.123Z"`

**Type**: String

---

## 📋 State Examples

### State 1: New User (Never Seen Tutorial)

```javascript
// localStorage is empty for these keys
localStorage.getItem('gadgetworld-tutorial-guided')
// Returns: null

localStorage.getItem('gadgetworld-tutorial-completed-date')
// Returns: null

// RESULT: Tutorial will appear after 1 second delay
```

---

### State 2: Completed Tutorial

```javascript
// User finished all 5 steps
localStorage.getItem('gadgetworld-tutorial-guided')
// Returns: "true" (string)

localStorage.getItem('gadgetworld-tutorial-completed-date')
// Returns: "2026-02-04T10:30:45.123Z"

// RESULT: Tutorial will NOT appear again (ever)
```

---

### State 3: Skipped Tutorial (Recent)

```javascript
// User clicked "Skip Tutorial" or close button
localStorage.getItem('gadgetworld-tutorial-guided')
// Returns: "skipped"

localStorage.getItem('gadgetworld-tutorial-completed-date')
// Returns: "2026-02-04T10:30:45.123Z"

// RESULT: Tutorial will NOT appear (for 90 days)
```

---

### State 4: Skipped Tutorial (90+ Days Ago)

```javascript
// User skipped more than 90 days ago
localStorage.getItem('gadgetworld-tutorial-guided')
// Returns: "skipped"

localStorage.getItem('gadgetworld-tutorial-completed-date')
// Returns: "2025-11-05T10:30:45.123Z" (old date)

// RESULT: Tutorial MAY appear again (90+ days passed)
```

---

## 🔄 State Transitions

### Transition 1: New User → Completes Tutorial

```javascript
// BEFORE (on page load)
guided: null
date: null

// AFTER (user clicks "Finish Tutorial" on Step 5)
guided: "true"
date: "2026-02-04T10:30:45.123Z"
```

**Code in WelcomeTutorial.tsx**:
```typescript
const handleNext = () => {
  if (currentStep < steps.length - 1) {
    setCurrentStep(prev => prev + 1);
  } else {
    // Mark tutorial as completed
    localStorage.setItem('gadgetworld-tutorial-guided', 'true');
    localStorage.setItem('gadgetworld-tutorial-completed-date', new Date().toISOString());
    onClose();
  }
};
```

---

### Transition 2: New User → Skips Tutorial

```javascript
// BEFORE (on page load)
guided: null
date: null

// AFTER (user clicks "Skip Tutorial" on Step 1)
guided: "skipped"
date: "2026-02-04T10:30:45.123Z"
```

**Code in WelcomeTutorial.tsx**:
```typescript
const handleSkip = () => {
  // Mark as guided but skipped
  localStorage.setItem('gadgetworld-tutorial-guided', 'skipped');
  localStorage.setItem('gadgetworld-tutorial-completed-date', new Date().toISOString());
  onClose();
};
```

---

## 🧪 Testing localStorage

### Check Current State

```javascript
// In browser console
const status = {
  guided: localStorage.getItem('gadgetworld-tutorial-guided'),
  date: localStorage.getItem('gadgetworld-tutorial-completed-date'),
  dateReadable: new Date(localStorage.getItem('gadgetworld-tutorial-completed-date')).toLocaleString()
};

console.table(status);
```

### Reset to New User State

```javascript
// Clear tutorial data
localStorage.removeItem('gadgetworld-tutorial-guided');
localStorage.removeItem('gadgetworld-tutorial-completed-date');

// Refresh page to see tutorial
location.reload();
```

### Set to Completed State

```javascript
// Simulate completed tutorial
localStorage.setItem('gadgetworld-tutorial-guided', 'true');
localStorage.setItem('gadgetworld-tutorial-completed-date', new Date().toISOString());

// Refresh to verify tutorial doesn't appear
location.reload();
```

### Set to Skipped State (Recent)

```javascript
// Simulate recent skip
localStorage.setItem('gadgetworld-tutorial-guided', 'skipped');
localStorage.setItem('gadgetworld-tutorial-completed-date', new Date().toISOString());

location.reload();
```

### Set to Skipped State (Old - 91 Days Ago)

```javascript
// Simulate skip from 91 days ago
const oldDate = new Date();
oldDate.setDate(oldDate.getDate() - 91);

localStorage.setItem('gadgetworld-tutorial-guided', 'skipped');
localStorage.setItem('gadgetworld-tutorial-completed-date', oldDate.toISOString());

location.reload();
// Tutorial SHOULD appear again
```

---

## 📖 Logic in Code

### WelcomeTutorialWrapper.tsx Logic

```typescript
useEffect(() => {
  // Check if user has been guided before
  const hasBeenGuided = localStorage.getItem('gadgetworld-tutorial-guided');
  const completedDate = localStorage.getItem('gadgetworld-tutorial-completed-date');

  // Show tutorial for new users who haven't been guided
  if (!hasBeenGuided) {
    // Small delay to let the page load first
    const timer = setTimeout(() => {
      setShowTutorial(true);
    }, 1000);
    return () => clearTimeout(timer);
  }

  // Optional: Show tutorial again after 90 days for users who skipped
  if (hasBeenGuided === 'skipped' && completedDate) {
    const completedTime = new Date(completedDate).getTime();
    const ninetyDays = 90 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    if (now - completedTime > ninetyDays) {
      setShowTutorial(true);
    }
  }
}, []);
```

---

## 🔍 Decision Tree

```
User visits page
    ↓
Check localStorage('gadgetworld-tutorial-guided')
    ↓
┌────────────────┬────────────────┬────────────────┐
│                │                │                │
null/undefined   'true'          'skipped'
(NEW USER)       (COMPLETED)      (SKIPPED)
│                │                │
↓                ↓                ↓
Show Tutorial    Don't Show       Check Date
│                                 │
↓                            ┌────┴────┐
Wait 1 second               │          │
│                           <90 days   >=90 days
↓                           │          │
Display Modal               ↓          ↓
                            Don't      Show
                            Show       Tutorial
```

---

## 💡 Pro Tips

### 1. Testing in Incognito Mode
```
Incognito/Private browsing = Fresh localStorage
Perfect for testing new user experience!
```

### 2. Watch localStorage Changes
```javascript
// Monitor localStorage in real-time
window.addEventListener('storage', (e) => {
  if (e.key && e.key.includes('gadgetworld')) {
    console.log(`${e.key} changed from ${e.oldValue} to ${e.newValue}`);
  }
});
```

### 3. Export/Import localStorage State
```javascript
// Export current state
const exportState = () => {
  return {
    guided: localStorage.getItem('gadgetworld-tutorial-guided'),
    date: localStorage.getItem('gadgetworld-tutorial-completed-date')
  };
};

// Import saved state
const importState = (state) => {
  if (state.guided) localStorage.setItem('gadgetworld-tutorial-guided', state.guided);
  if (state.date) localStorage.setItem('gadgetworld-tutorial-completed-date', state.date);
};

// Usage
const saved = exportState();
console.log(saved);
importState(saved);
```

### 4. Check localStorage Size
```javascript
// See how much space localStorage is using
let total = 0;
for (let key in localStorage) {
  if (localStorage.hasOwnProperty(key)) {
    total += localStorage[key].length + key.length;
  }
}
console.log(`localStorage size: ${total} bytes (~${(total/1024).toFixed(2)} KB)`);
```

---

## 🚨 Common Issues

### Issue: localStorage Not Persisting

**Causes**:
- Browser is in private/incognito mode
- Browser has localStorage disabled
- Storage quota exceeded
- Browser security settings

**Test**:
```javascript
try {
  localStorage.setItem('test', 'test');
  localStorage.removeItem('test');
  console.log('✅ localStorage is working');
} catch (e) {
  console.error('❌ localStorage is blocked:', e);
}
```

---

### Issue: Tutorial Shows Every Time

**Cause**: localStorage is being cleared on each load

**Debug**:
```javascript
// Check if values are being set
console.log('Before:', {
  guided: localStorage.getItem('gadgetworld-tutorial-guided'),
  date: localStorage.getItem('gadgetworld-tutorial-completed-date')
});

// Complete tutorial, then check again
console.log('After:', {
  guided: localStorage.getItem('gadgetworld-tutorial-guided'),
  date: localStorage.getItem('gadgetworld-tutorial-completed-date')
});
```

---

### Issue: Tutorial Never Shows

**Cause**: localStorage already has guided='true'

**Fix**:
```javascript
// Clear and refresh
localStorage.removeItem('gadgetworld-tutorial-guided');
localStorage.removeItem('gadgetworld-tutorial-completed-date');
location.reload();
```

---

## 📊 Analytics Integration (Optional)

Track tutorial engagement:

```javascript
// Track when tutorial is shown
if (showTutorial) {
  // Send to your analytics
  analytics.track('Tutorial Shown', {
    device: deviceType,
    timestamp: new Date().toISOString()
  });
}

// Track completion
localStorage.setItem('gadgetworld-tutorial-guided', 'true');
analytics.track('Tutorial Completed', {
  device: deviceType,
  stepsCompleted: 5
});

// Track skip
localStorage.setItem('gadgetworld-tutorial-guided', 'skipped');
analytics.track('Tutorial Skipped', {
  device: deviceType,
  skippedAt: currentStep
});
```

---

## 🔐 Security Note

**localStorage is not encrypted** - Don't store sensitive data!

✅ **Good for**:
- User preferences
- Tutorial completion status
- Non-sensitive settings
- UI state

❌ **Never store**:
- Passwords
- API keys
- Personal information
- Payment details

---

## 🎯 Summary

| Key | Purpose | Values | When Set |
|-----|---------|--------|----------|
| `gadgetworld-tutorial-guided` | Track status | `null`, `'true'`, `'skipped'` | On complete/skip |
| `gadgetworld-tutorial-completed-date` | Track when | ISO timestamp | Same time as guided |

**Flow**:
1. New user → both keys are null → Tutorial shows
2. User completes → Set guided='true' → Tutorial never shows again
3. User skips → Set guided='skipped' → May re-show after 90 days

Simple, effective, and user-friendly! ✨
