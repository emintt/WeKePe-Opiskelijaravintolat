interface Restaurant {
    name: string;
    location: {
        type: 'Point',
        coordinates: number[]
    };
    _id: string;
    company:'Sodexo' |'Compass Group';
    address: string;
    city: string;
    postalCode: string;
    phone: string;
    companyId: number;
}

export {Restaurant}
