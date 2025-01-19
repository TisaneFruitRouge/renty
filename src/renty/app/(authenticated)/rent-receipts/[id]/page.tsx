
export default async function Page({ params }: { params: Promise<{ id: string }> }) {

    const id = (await params).id

    return (
        <div>Receipt {id}</div>
    )
}