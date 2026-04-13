import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, or } from 'firebase/firestore';

export async function POST(request) {
  try {
    const body = await request.json();
    const taskRef = await addDoc(collection(db, 'tasks'), {
      ...body,
      createdAt: new Date().toISOString()
    });
    return NextResponse.json({ id: taskRef.id, ...body }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get('uid');
  const role = searchParams.get('role');

  try {
    let q;
    const tasksRef = collection(db, 'tasks');

    if (role === 'admin') {
      q = query(tasksRef);
    } else {
      q = query(
        tasksRef,
        or(
          where('ownerId', '==', uid),
          where('assignedTo', '==', uid)
        )
      );
    }

    const snapshot = await getDocs(q);
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}