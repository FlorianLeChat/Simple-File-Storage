//
// Composant générique des calendriers.
//  Source : https://ui.shadcn.com/docs/components/calendar
//
import { merge } from "@/utilities/tailwind";
import { ChevronUp,
	ChevronLeft,
	ChevronRight,
	ChevronDown } from "lucide-react";
import { UI,
	DayFlag,
	DayPicker,
	SelectionState,
	type ChevronProps } from "react-day-picker";
import { buttonVariants } from "@/components/ui/button";
import type { ComponentProps } from "react";

export type CalendarProps = ComponentProps<typeof DayPicker>;

function Chevron( { orientation }: ChevronProps )
{
	if ( orientation === "up" )
	{
		return <ChevronUp className="size-4" />;
	}

	if ( orientation === "down" )
	{
		return <ChevronDown className="size-4" />;
	}

	if ( orientation === "right" )
	{
		return <ChevronRight className="size-4" />;
	}

	return <ChevronLeft className="size-4" />;
}

export function Calendar( {
	className,
	classNames,
	showOutsideDays = true,
	...props
}: CalendarProps )
{
	return (
		<DayPicker
			showOutsideDays={showOutsideDays}
			className={merge( "p-3", className )}
			classNames={{
				[ UI.Months ]: "relative",
				[ UI.Month ]: "space-y-4 ml-0",
				[ UI.MonthCaption ]: "flex justify-center items-center h-7",
				[ UI.CaptionLabel ]: "text-sm font-medium",
				[ UI.PreviousMonthButton ]: merge(
					buttonVariants( { variant: "outline" } ),
					"absolute left-1 top-0 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
				),
				[ UI.NextMonthButton ]: merge(
					buttonVariants( { variant: "outline" } ),
					"absolute right-1 top-0 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
				),
				[ UI.MonthGrid ]: "w-full border-collapse space-y-1",
				[ UI.Weekdays ]: "flex",
				[ UI.Weekday ]:
					"text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
				[ UI.Week ]: "flex w-full mt-2",
				[ UI.Day ]:
					"h-9 w-9 text-center rounded-md text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
				[ UI.DayButton ]: merge(
					buttonVariants( { variant: "ghost" } ),
					"h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-primary hover:text-primary-foreground"
				),
				[ SelectionState.range_end ]: "day-range-end",
				[ SelectionState.selected ]:
					"bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
				[ SelectionState.range_middle ]:
					"aria-selected:bg-accent aria-selected:text-accent-foreground",
				[ DayFlag.today ]: "bg-accent text-accent-foreground",
				[ DayFlag.outside ]:
					"day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
				[ DayFlag.disabled ]: "text-muted-foreground opacity-50",
				[ DayFlag.hidden ]: "invisible",
				...classNames
			}}
			components={{
				Chevron: ( { ...options } ) => <Chevron {...options} />
			}}
			{...props}
		/>
	);
}