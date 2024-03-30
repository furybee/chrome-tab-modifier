<template>
	<div class="container mx-auto max-w-5xl p-4">
		<div class="card bg-base-200">
			<div class="card-body">
				<h2 class="card-title">Concept</h2>
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
				<h2 class="card-title">Features</h2>

				<ul class="list-disc ml-3">
					<li>You can rename a tab.</li>
					<li>You can change any tab (fav)icon.</li>
					<li>You can pin a website without effort.</li>
					<li>
						You can group your tabs easily.
						<NewFeature />
					</li>
					<li>You can protect some websites from accidental closure with a confirm box.</li>
					<li>You can avoid duplicate tabs by setting up the unique property.</li>
					<li>You can mute the sound of any website before it plays it.</li>
					<li>And the icing on the cake... Combine all of them!</li>
				</ul>
			</div>
		</div>

		<div class="card bg-base-200 mt-4">
			<div class="card-body">
				<h2 class="card-title">Tab Rules</h2>

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
					This is the key of your rule. It will determine if your rule will be applied or not. You
					want to catch GMail? You can set your rule with "Contains" detection and "mail.google.com"
					URL fragment. Another solution could be to set "Starts with" detection and
					"https://mail.google.com". Try any combination to achieve what you want.
				</p>
				<p class="text-accent">
					After defining the core of your rule you can select some actions listed below.
				</p>

				<h3 class="font-bold">Title</h3>
				<p>This action will rewrite the website title.</p>
				<p>
					Another advanced usage can be used with the title, you can inject some parts of the URL
					with the dollar syntax. This feature is linked to the "URL matcher" action, see
					afterwards. Use $0, $1, etc. depending on your regular expression defined in "URL
					matcher".
				</p>
				<p>
					As you can scan the URL, you can also scan the title and inject some parts of it with the
					"at (@)" syntax. This feature is linked to the "Title matcher" action, see afterwards. Use
					@0, @1, etc. depending on your regular expression defined in "Title matcher".
				</p>

				<h3 class="font-bold">Icon</h3>
				<p>This action will replace the website (fav)icon.</p>
				<p>You can select an icon provided by the extension.</p>
				<p>
					Otherwise, you can define an icon URL in the input like
					"https://www.google.com/favicon.ico".
				</p>
				<p>In case you want to define a local icon from your computer, you have 2 options:</p>
				<ul class="list-disc ml-3">
					<li>upload your icon somewhere like imgur.com and paste the direct link</li>
					<li>
						go to duri.me and drag & drop your icon, then click on "Copy as DataURI" and paste it.
						This is your icon transformed in the Data URI format
					</li>
				</ul>

				<h3 class="font-bold">Group</h3>
				<p>This action will move your tab to a group.</p>

				<h3 class="font-bold">Pinned</h3>
				<p>This action will pin the tab.</p>

				<h3 class="font-bold">Protected</h3>
				<p>This action will ask you before closing the tab.</p>
				<p>
					Note: the confirm box will be triggered if you (or the website itself) refresh the tab, as
					the extension can't differentiate closure and refresh.
				</p>

				<h3 class="font-bold">Unique</h3>
				<p>
					This action will automatically close duplicate tabs. Besides the extension will not focus
					the original tab after closing the duplicate one.
				</p>
				<p>
					Scenario: create a rule based on GMail with unique action. Open GMail, open another GMail,
					the last one will be closed.
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
					title, like [a-z]*@gmail.com and use @0 in the title input to inject the variable.
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
				<h2 class="card-title">Additional notes</h2>

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

<script lang="ts" setup>
import NewFeature from '../../../global/NewFeature.vue';
</script>

<style scoped>
h3 {
	margin-top: 1rem;
}
</style>
