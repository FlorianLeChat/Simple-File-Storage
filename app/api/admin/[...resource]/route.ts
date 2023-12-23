import prisma from "@/utilities/prisma";
import { NextResponse } from "next/server";
import { type RaPayload, defaultHandler } from "ra-data-simple-prisma";

const handler = async ( request: Request ) =>
{
	try
	{
		const result = await defaultHandler(
			( await request.json() ) as RaPayload,
			prisma
		);

		return NextResponse.json( result );
	}
	catch
	{
		return new NextResponse( null, { status: 400 } );
	}
};

export {
	handler as GET,
	handler as POST,
	handler as PUT,
	handler as PATCH,
	handler as DELETE
};