import { registerContextMenuOnClickedEvent } from './events/on-context-menu-clicked-event.ts';
import { registerOnInstalledEvent } from './events/on-installed-event.ts';
import { registerOnTabsUpdatedEvent } from './events/on-updated-tabs-event.ts';
import { registerOnMessageEvent } from './events/on-message-event.ts';
import { registerOnTabsMovedEvent } from './events/on-moved-tabs-event.ts';
import { createMergeWindowsContextMenu } from './context-menus/merger.ts';
import { createRenameTabContextMenu } from './context-menus/rename.ts';

registerOnInstalledEvent();
registerContextMenuOnClickedEvent();
registerOnTabsUpdatedEvent();
registerOnTabsMovedEvent();
registerOnMessageEvent();

createMergeWindowsContextMenu();
createRenameTabContextMenu();

export {};
