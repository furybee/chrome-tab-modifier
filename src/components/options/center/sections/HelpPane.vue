<template>
	<div class="container mx-auto max-w-5xl p-4">
		<div class="card bg-base-200">
			<div class="card-body">
				<h2 class="card-title">💡 Concept</h2>
				<p>
					Take control of your browser tabs! With this extension you are able to change some
					behaviors on any website. Define your rules and let the extension makes the job
					automatically.
				</p>
				<p>All of your data are stored on your computer, We don't have any access to it.</p>
			</div>
		</div>

		<div class="card bg-base-200 mt-4">
			<div class="card-body">
				<h2 class="card-title">✨ Features</h2>

				<ul class="list-disc ml-3 space-y-1">
					<li>
						<strong>Rename tabs</strong> - Customize tab titles with static text or dynamic
						patterns.
					</li>
					<li>
						<strong>Change favicons</strong> - Replace any tab icon with custom images, URLs, or
						paste directly from clipboard.
					</li>
					<li>
						<strong>Pin tabs</strong> - Automatically pin important websites to keep them always
						visible.
					</li>
					<li>
						<strong>Group tabs</strong> - Organize tabs into custom colored groups for better
						workspace management.
					</li>
					<li>
						<strong>Protect tabs</strong> - Prevent accidental closure with a confirmation dialog on
						protected websites.
					</li>
					<li>
						<strong>Unique tabs</strong> - Automatically close duplicate tabs to keep your browser
						clean.
					</li>
					<li><strong>Mute tabs</strong> - Silence any website before it starts playing sound.</li>
					<li>
						<strong>Auto-close inactive tabs</strong> - Automatically close tabs after a specified
						duration and restore them from Tab Hive.
					</li>
					<li>
						<strong>Tab Hive</strong> - View and restore recently closed tabs with search
						functionality.
					</li>
					<li>
						<strong>Spot Search</strong> - Instantly search through all your open tabs and bookmarks
						with a spotlight-style interface (Alt+Shift+E).
					</li>
					<li>
						<strong>Merge windows</strong> - Combine all browser windows into one with a keyboard
						shortcut (Alt+Shift+W) or context menu.
					</li>
					<li>
						<strong>Lightweight Mode</strong> - Reduce memory usage by disabling Tabee on specific
						domains.
					</li>
					<li>
						<strong>RegEx support</strong> - Use advanced pattern matching with regular expressions
						for URL detection and title manipulation.
					</li>
					<li>
						<strong>Context menu</strong> - Right-click any page to quickly create or edit rules for
						that URL.
					</li>
					<li>
						<strong>Side Panel</strong> - Quick access to Tab Hive and rule creation from Chrome's
						side panel.
					</li>
					<li>
						<strong>Sync across devices</strong> - All your rules and settings sync automatically
						via Chrome Sync.
					</li>
					<li>And the icing on the cake... <strong>Combine all of them!</strong></li>
				</ul>
			</div>
		</div>

		<div class="card bg-base-200 mt-4">
			<div class="card-body">
				<h2 class="card-title">⌨️ Keyboard Shortcuts</h2>

				<h3 class="font-bold">Spot Search</h3>
				<p>Quickly search through your open tabs and bookmarks with a spotlight-style interface:</p>
				<ul class="list-disc ml-3">
					<li>
						<strong>Windows/Linux:</strong> <kbd class="kbd kbd-sm">Alt</kbd> +
						<kbd class="kbd kbd-sm">Shift</kbd> + <kbd class="kbd kbd-sm">E</kbd>
					</li>
					<li>
						<strong>Mac:</strong> <kbd class="kbd kbd-sm">⌘ Command</kbd> +
						<kbd class="kbd kbd-sm">Shift</kbd> + <kbd class="kbd kbd-sm">E</kbd>
					</li>
				</ul>
				<p class="mt-2">
					Type to filter tabs by title, URL, or tab group. Use arrow keys to navigate and press
					Enter to switch to a tab or open a bookmark.
				</p>

				<h3 class="font-bold">Merge All Windows</h3>
				<p>
					Quickly merge all browser windows into the currently focused window using the keyboard
					shortcut:
				</p>
				<ul class="list-disc ml-3">
					<li>
						<strong>Windows/Linux:</strong> <kbd class="kbd kbd-sm">Alt</kbd> +
						<kbd class="kbd kbd-sm">Shift</kbd> + <kbd class="kbd kbd-sm">W</kbd>
					</li>
					<li>
						<strong>Mac:</strong> <kbd class="kbd kbd-sm">⌘ Command</kbd> +
						<kbd class="kbd kbd-sm">Shift</kbd> + <kbd class="kbd kbd-sm">W</kbd>
					</li>
				</ul>
				<p class="mt-2">
					You can also access this feature by right-clicking anywhere and selecting "Merge All
					Windows" from the context menu.
				</p>
			</div>
		</div>

		<div class="card bg-base-200 mt-4">
			<div class="card-body">
				<h2 class="card-title">📋 Tab Rules</h2>

				<p>You have to create a "tab rule". A tab rule has:</p>

				<h3 class="font-bold">Name</h3>
				<p>This name is used for you, just to find your rule among others.</p>

				<h3 class="font-bold">Detection</h3>
				<p>
					Choices are either "Starts with", "Contains", "Exact", "Ends with" or "RegExp". The
					extension must know how to apply your rule depending on the detection you need. You may
					need to catch a word inside the URL so you will select "Contains" or catch only PNG files
					so you will select "Ends with", etc. Most of the time, "Contains" does what you want, this
					is the default selected detection.
				</p>

				<h3 class="font-bold">URL fragment</h3>
				<p>
					This is the key of your rule. It will determine if your rule will be applied or not. For
					example, to catch GitHub repositories, you can set your rule with "Contains" detection and
					"github.com" URL fragment. Another solution could be to set "Starts with" detection and
					"https://github.com". Try any combination to achieve what you want.
				</p>
				<p class="text-accent">
					After defining the core of your rule you can select some actions listed below.
				</p>

				<h3 class="font-bold">Title</h3>
				<p>This action will rewrite the website title.</p>
				<p>You can use special variables in your title:</p>
				<ul class="list-disc ml-3 space-y-1">
					<li>
						<code class="bg-base-300 px-1 rounded">{title}</code> - The original page title
					</li>
					<li>
						<code class="bg-base-300 px-1 rounded">{.css-selector}</code> - Extract text from any
						element on the page using a CSS selector
					</li>
				</ul>
				<p class="mt-2">
					<strong>Example for YouTube:</strong> To prepend the channel name to video titles, use:
				</p>
				<p>
					<code class="bg-base-300 px-1 rounded">{.ytd-channel-name a} - {title}</code>
				</p>
				<p class="mt-2">
					This works with any valid CSS selector:
					<code class="bg-base-300 px-1 rounded">{#header h1}</code>,
					<code class="bg-base-300 px-1 rounded">{.author-name}</code>,
					<code class="bg-base-300 px-1 rounded">{[data-testid="username"]}</code>, etc.
				</p>
				<p class="mt-2">
					<strong>Advanced:</strong> You can also inject parts of the URL with the dollar ($)
					syntax. This feature is linked to the "URL matcher" action. Use $0, $1, etc. depending on
					your regular expression defined in "URL matcher".
				</p>
				<p>
					Similarly, you can inject parts of the title with the "at" (@) syntax. This feature is
					linked to the "Title matcher" action. Use @0, @1, etc. depending on your regular
					expression defined in "Title matcher".
				</p>

				<h3 class="font-bold">Icon</h3>
				<p>This action will replace the website (fav)icon.</p>
				<p>You can select an icon provided by the extension.</p>
				<p>
					Otherwise, you can define an icon URL in the input like "https://example.com/favicon.ico".
				</p>
				<p>For local icons from your computer, you have multiple options:</p>
				<ul class="list-disc ml-3">
					<li>
						<strong>Paste directly</strong>: Copy an image (screenshot, file, etc.) and paste it
						directly into the "Custom Icon" field - it will be automatically converted to base64!
					</li>
					<li>Upload your icon somewhere like imgur.com and paste the direct link</li>
					<li>Use a service to convert your icon to Data URI format manually</li>
				</ul>

				<h3 class="font-bold">Group</h3>
				<p>This action will move your tab to a group.</p>

				<h3 class="font-bold">Pinned</h3>
				<p>This action will pin the tab.</p>

				<h3 class="font-bold">Protected</h3>
				<p>This action will ask you before refreshing or closing the tab.</p>
				<p>
					Note: Require sticky activation for the dialog to be displayed. In other words, the
					browser will only show the dialog box if the frame or any embedded frame receives a user
					gesture or user interaction. If you have never interacted with the page, the dialog will
					not be displayed.
				</p>

				<h3 class="font-bold">Unique</h3>
				<p>
					This action will automatically close duplicate tabs. Besides the extension will not focus
					the original tab after closing the duplicate one.
				</p>
				<p>
					Scenario: create a rule based on your email service with unique action. Open your email,
					open another tab with the same email, the last one will be closed.
				</p>

				<h3 class="font-bold">Muted</h3>
				<p>This action will prevent the tab from playing sounds.</p>
				<p>
					To work, this feature requires that you enable this flag:
					chrome://flags/#enable-tab-audio-muting then restart your browser.
				</p>

				<h3 class="font-bold">Title matcher</h3>
				<p>
					An advanced usage, enter a regular expression to identify some title parts and use them
					inside the title itself, this is useful to reorder words or exclude some parts of the
					title, like [a-z]*@example.com and use @0 in the title input to inject the variable.
				</p>

				<h3 class="font-bold">URL matcher</h3>
				<p>
					An advanced usage, enter a regular expression to identify some URL parts and use them
					inside the title, like q=([^&]+) and use $0 in the title input to inject the variable.
				</p>
			</div>
		</div>

		<div class="card bg-base-200 mt-4">
			<div class="card-body">
				<h2 class="card-title">📝 Additional notes</h2>

				<p>After creating or editing a rule, refresh the tab(s) to apply the changes.</p>
				<p>
					The order of your rules is important, if an URL triggers more than one rule, the first one
					will be applied. You can reorder your rules anyway.
				</p>
				<p>Some interesting tab rules are listed here for inspiration purposes.</p>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup></script>

<style scoped>
h3 {
	margin-top: 1rem;
}
</style>
