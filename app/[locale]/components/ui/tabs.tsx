//
// Composant générique des onglets.
//  Source : https://ui.shadcn.com/docs/components/tabs
//

"use client";

import { merge } from "@/utilities/tailwind";
import { Tabs as TabsPrimitive } from "radix-ui";
import { forwardRef,
	type ElementRef,
	type ComponentPropsWithoutRef } from "react";

const Tabs = TabsPrimitive.Root;
const TabsList = forwardRef<
	ElementRef<typeof TabsPrimitive.List>,
	ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>( ( { className, ...props }, ref ) => (
	<TabsPrimitive.List
		ref={ref}
		className={merge(
			"bg-muted text-muted-foreground inline-flex h-10 items-center justify-center rounded-md p-1",
			className
		)}
		{...props}
	/>
) );

TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = forwardRef<
	ElementRef<typeof TabsPrimitive.Trigger>,
	ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>( ( { className, ...props }, ref ) => (
	<TabsPrimitive.Trigger
		ref={ref}
		className={merge(
			"ring-offset-background focus-visible:ring-ring data-[state=active]:bg-background data-[state=active]:text-foreground inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm",
			className
		)}
		{...props}
	/>
) );

TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = forwardRef<
	ElementRef<typeof TabsPrimitive.Content>,
	ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>( ( { className, ...props }, ref ) => (
	<TabsPrimitive.Content
		ref={ref}
		className={merge(
			"ring-offset-background focus-visible:ring-ring mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
			className
		)}
		{...props}
	/>
) );

TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };