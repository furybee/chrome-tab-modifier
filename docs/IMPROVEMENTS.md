# Future Improvements & Ideas

This document tracks potential improvements and feature ideas for Tabee.

## Storage Optimization

### ✅ Implemented: Data Compression (v1.0.1)
- **Status**: Implemented in v1.0.1
- **Technology**: LZ-String compression (UTF-16)
- **Results**: 79-88% size reduction
- **Impact**: Increased capacity from ~15-20 rules to ~250 rules (without icons)

### 💡 Future: Storage Chunking Strategy

**Problem**: Even with compression, users with 250+ rules may hit the 8KB Chrome sync storage limit per item.

**Solution**: Implement a chunking strategy to split data across multiple storage keys.

#### Implementation Strategy

Instead of storing all data in a single key:
```javascript
// Current approach (compressed, single key)
chrome.storage.sync.set({
  tab_modifier_compressed: "compressed_data" // ❌ Limited to 8KB
})
```

Split data across multiple chunks:
```javascript
// Proposed approach (compressed + chunked)
chrome.storage.sync.set({
  tab_modifier_meta: {
    version: "2.0",
    chunks: 3,           // Number of chunks
    totalSize: 15000,    // Total uncompressed size
    compressed: true     // Whether data is compressed
  },
  tab_modifier_chunk_0: "compressed_part_1", // Max 8KB
  tab_modifier_chunk_1: "compressed_part_2", // Max 8KB
  tab_modifier_chunk_2: "compressed_part_3"  // Max 8KB
})
```

#### Benefits
- **Theoretical limit**: 512 items × 8KB = **~4MB** (vs current 8KB)
- **Practical capacity**: With compression + chunking: **500-1,000+ rules**
- **Maintains sync**: Still uses chrome.storage.sync for cross-device sync
- **Backward compatible**: Can detect and migrate from single-key format

#### Challenges
- More complex read/write logic
- Uses more of the 512-item quota
- Slightly slower (multiple key reads required)
- Need to handle partial failures during write

#### When to Implement
- **Priority**: Low (only needed when users regularly hit 250 rule limit)
- **Monitor**: Track user complaints about storage limits
- **Trigger**: If 5+ users report hitting the limit with compression enabled

#### Implementation Notes
```typescript
// Pseudo-code for chunking logic
const CHUNK_SIZE = 7000; // Leave some margin below 8KB limit

async function saveWithChunking(data: TabModifierSettings) {
  const compressed = compressData(data);
  const chunks = splitIntoChunks(compressed, CHUNK_SIZE);

  const storageData = {
    tab_modifier_meta: {
      version: "2.0",
      chunks: chunks.length,
      totalSize: compressed.length,
      compressed: true,
      timestamp: Date.now()
    }
  };

  chunks.forEach((chunk, index) => {
    storageData[`tab_modifier_chunk_${index}`] = chunk;
  });

  await chrome.storage.sync.set(storageData);

  // Clean up old chunks if we used fewer this time
  await cleanupOldChunks(chunks.length);
}

async function loadWithChunking(): Promise<TabModifierSettings> {
  const meta = await chrome.storage.sync.get('tab_modifier_meta');

  if (!meta.tab_modifier_meta) {
    // Fallback to old format
    return loadLegacyFormat();
  }

  const chunkKeys = Array.from(
    { length: meta.tab_modifier_meta.chunks },
    (_, i) => `tab_modifier_chunk_${i}`
  );

  const chunks = await chrome.storage.sync.get(chunkKeys);
  const reassembled = chunkKeys.map(key => chunks[key]).join('');

  return decompressData(reassembled);
}
```

#### Related Issues
- None yet (preemptive documentation)

#### Migration Path
1. Detect old format (single compressed key)
2. Check if data size requires chunking (> 7KB compressed)
3. If yes, split and migrate to chunked format
4. If no, keep in single-key format for simplicity
5. Always support reading both formats

---

## Other Ideas

### User Interface Improvements
- [ ] Visual indicator showing storage usage (e.g., "Using 2,450 / 8,192 bytes")
- [ ] Warning when approaching storage limit (> 80% full)
- [ ] Rule organization: folders/categories for better management
- [ ] Bulk operations: enable/disable/delete multiple rules at once

### Storage Alternatives
- [ ] Optional cloud sync via Google Drive API (for power users)
- [ ] Optional cloud sync via GitHub Gist (free, unlimited)
- [ ] Local-only mode with larger storage.local limits (10MB)
- [ ] Export/import presets (pre-configured rule sets)

### Performance
- [ ] Lazy loading of rules in UI (virtualized list)
- [ ] Rule caching for faster tab matching
- [ ] Debounced saves to reduce write operations

### Features
- [ ] Rule templates/presets (common patterns)
- [ ] Rule testing mode (preview before applying)
- [ ] Statistics: most-used rules, match counts
- [ ] Conditional rules (time-based, domain combinations)

---

**Last Updated**: 2025-10-21
