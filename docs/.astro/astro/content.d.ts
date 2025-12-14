declare module 'astro:content' {
	interface Render {
		'.mdx': Promise<{
			Content: import('astro').MDXContent;
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
			components: import('astro').MDXInstance<{}>['components'];
		}>;
	}
}

declare module 'astro:content' {
	interface RenderResult {
		Content: import('astro/runtime/server/index.js').AstroComponentFactory;
		headings: import('astro').MarkdownHeading[];
		remarkPluginFrontmatter: Record<string, any>;
	}
	interface Render {
		'.md': Promise<RenderResult>;
	}

	export interface RenderedContent {
		html: string;
		metadata?: {
			imagePaths: Array<string>;
			[key: string]: unknown;
		};
	}
}

declare module 'astro:content' {
	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	/** @deprecated Use `getEntry` instead. */
	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	/** @deprecated Use `getEntry` instead. */
	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E,
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E,
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown,
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E,
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[],
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[],
	): Promise<CollectionEntry<C>[]>;

	export function render<C extends keyof AnyEntryMap>(
		entry: AnyEntryMap[C][string],
	): Promise<RenderResult>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C,
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
				}
			: {
					collection: C;
					id: keyof DataEntryMap[C];
				}
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C,
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"docs": {
"README.md": {
	id: "README.md";
  slug: "readme";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
"api/agents.md": {
	id: "api/agents.md";
  slug: "api/agents";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
"api/config.md": {
	id: "api/config.md";
  slug: "api/config";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
"api/events.md": {
	id: "api/events.md";
  slug: "api/events";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
"api/kestra.md": {
	id: "api/kestra.md";
  slug: "api/kestra";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
"api/matches.md": {
	id: "api/matches.md";
  slug: "api/matches";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
"api/oumi.md": {
	id: "api/oumi.md";
  slug: "api/oumi";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
"api/websocket.md": {
	id: "api/websocket.md";
  slug: "api/websocket";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
"architecture/data-flow.md": {
	id: "architecture/data-flow.md";
  slug: "architecture/data-flow";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
"architecture/overview.md": {
	id: "architecture/overview.md";
  slug: "architecture/overview";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
"architecture/system-design.md": {
	id: "architecture/system-design.md";
  slug: "architecture/system-design";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
"backend/agents.md": {
	id: "backend/agents.md";
  slug: "backend/agents";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
"backend/database.md": {
	id: "backend/database.md";
  slug: "backend/database";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
"backend/orchestration.md": {
	id: "backend/orchestration.md";
  slug: "backend/orchestration";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
"backend/overview.md": {
	id: "backend/overview.md";
  slug: "backend/overview";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
"backend/routes.md": {
	id: "backend/routes.md";
  slug: "backend/routes";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
"backend/scoring.md": {
	id: "backend/scoring.md";
  slug: "backend/scoring";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
"backend/websocket.md": {
	id: "backend/websocket.md";
  slug: "backend/websocket";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
"deployment/backend.md": {
	id: "deployment/backend.md";
  slug: "deployment/backend";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
"deployment/frontend.md": {
	id: "deployment/frontend.md";
  slug: "deployment/frontend";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
"deployment/kestra.md": {
	id: "deployment/kestra.md";
  slug: "deployment/kestra";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
"deployment/overview.md": {
	id: "deployment/overview.md";
  slug: "deployment/overview";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
"development/setup.md": {
	id: "development/setup.md";
  slug: "development/setup";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
"development/testing.md": {
	id: "development/testing.md";
  slug: "development/testing";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
"frontend/api-client.md": {
	id: "frontend/api-client.md";
  slug: "frontend/api-client";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
"frontend/components.md": {
	id: "frontend/components.md";
  slug: "frontend/components";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
"frontend/overview.md": {
	id: "frontend/overview.md";
  slug: "frontend/overview";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
"frontend/pages.md": {
	id: "frontend/pages.md";
  slug: "frontend/pages";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
"getting-started/configuration.md": {
	id: "getting-started/configuration.md";
  slug: "getting-started/configuration";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
"getting-started/installation.md": {
	id: "getting-started/installation.md";
  slug: "getting-started/installation";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
"getting-started/quick-start.md": {
	id: "getting-started/quick-start.md";
  slug: "getting-started/quick-start";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
"guides/creating-agents.md": {
	id: "guides/creating-agents.md";
  slug: "guides/creating-agents";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
"guides/fine-tuning.md": {
	id: "guides/fine-tuning.md";
  slug: "guides/fine-tuning";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
"guides/running-matches.md": {
	id: "guides/running-matches.md";
  slug: "guides/running-matches";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
"guides/tool-execution.md": {
	id: "guides/tool-execution.md";
  slug: "guides/tool-execution";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
"index.md": {
	id: "index.md";
  slug: "index";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
"integrations/cline.md": {
	id: "integrations/cline.md";
  slug: "integrations/cline";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
"integrations/groq.md": {
	id: "integrations/groq.md";
  slug: "integrations/groq";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
"integrations/kestra.md": {
	id: "integrations/kestra.md";
  slug: "integrations/kestra";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
"integrations/oumi.md": {
	id: "integrations/oumi.md";
  slug: "integrations/oumi";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
"intro.md": {
	id: "intro.md";
  slug: "intro";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
"troubleshooting/common-issues.md": {
	id: "troubleshooting/common-issues.md";
  slug: "troubleshooting/common-issues";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
"troubleshooting/debugging.md": {
	id: "troubleshooting/debugging.md";
  slug: "troubleshooting/debugging";
  body: string;
  collection: "docs";
  data: any
} & { render(): Render[".md"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	export type ContentConfig = never;
}
