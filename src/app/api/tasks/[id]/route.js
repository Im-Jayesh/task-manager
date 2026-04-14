import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    const body = await request.json();
    
    const { id: _, ...dataToUpdate } = body;

    const taskRef = doc(db, 'tasks', id);
    await updateDoc(taskRef, {
      ...dataToUpdate,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ id, ...dataToUpdate }, { status: 200 });
  } catch (error) {
    console.error("Edit Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    await deleteDoc(doc(db, 'tasks', id));
    
    return NextResponse.json({ message: 'Task deleted' }, { status: 200 });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}