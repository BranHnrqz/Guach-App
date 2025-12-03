// Base de datos geográfica de El Salvador (Nueva Distribución 2024)
// Estructura: Departamento -> Municipio -> Distrito
// Coordenadas (Lat/Lng) aproximadas a las cabeceras o centros geográficos.

export const DATA_EL_SALVADOR = [
    {
        nombre: "San Salvador",
        lat: 13.6929, lng: -89.2182,
        municipios: [
            {
                nombre: "San Salvador Norte",
                lat: 13.9333, lng: -89.1833,
                distritos: [
                    { nombre: "Aguilares", lat: 13.9567, lng: -89.1896 },
                    { nombre: "El Paisnal", lat: 13.9736, lng: -89.2169 },
                    { nombre: "Guazapa", lat: 13.8806, lng: -89.1758 }
                ]
            },
            {
                nombre: "San Salvador Oeste",
                lat: 13.8042, lng: -89.1792,
                distritos: [
                    { nombre: "Apopa", lat: 13.8083, lng: -89.1786 },
                    { nombre: "Nejapa", lat: 13.8125, lng: -89.2314 }
                ]
            },
            {
                nombre: "San Salvador Este",
                lat: 13.7056, lng: -89.1378,
                distritos: [
                    { nombre: "Ilopango", lat: 13.7014, lng: -89.1128 },
                    { nombre: "San Martín", lat: 13.7319, lng: -89.0586 },
                    { nombre: "Soyapango", lat: 13.7100, lng: -89.1400 },
                    { nombre: "Tonacatepeque", lat: 13.7833, lng: -89.1167 }
                ]
            },
            {
                nombre: "San Salvador Centro",
                lat: 13.6929, lng: -89.2182,
                distritos: [
                    { nombre: "Ayutuxtepeque", lat: 13.7481, lng: -89.2053 },
                    { nombre: "Mejicanos", lat: 13.7369, lng: -89.2114 },
                    { nombre: "San Salvador", lat: 13.6929, lng: -89.2182 },
                    { nombre: "Cuscatancingo", lat: 13.7367, lng: -89.1833 },
                    { nombre: "Ciudad Delgado", lat: 13.7219, lng: -89.1683 }
                ]
            },
            {
                nombre: "San Salvador Sur",
                lat: 13.6333, lng: -89.1833,
                distritos: [
                    { nombre: "Panchimalco", lat: 13.6128, lng: -89.1792 },
                    { nombre: "Rosario de Mora", lat: 13.5756, lng: -89.2117 },
                    { nombre: "San Marcos", lat: 13.6589, lng: -89.1822 },
                    { nombre: "Santo Tomás", lat: 13.6417, lng: -89.1333 },
                    { nombre: "Santiago Texacuangos", lat: 13.6500, lng: -89.0833 }
                ]
            }
        ]
    },
    {
        nombre: "La Libertad",
        lat: 13.6769, lng: -89.2797,
        municipios: [
            {
                nombre: "La Libertad Norte",
                lat: 13.8333, lng: -89.2833,
                distritos: [
                    { nombre: "Quezaltepeque", lat: 13.8317, lng: -89.2719 },
                    { nombre: "San Matías", lat: 13.8958, lng: -89.3117 },
                    { nombre: "San Pablo Tacachico", lat: 13.9736, lng: -89.3417 }
                ]
            },
            {
                nombre: "La Libertad Centro",
                lat: 13.8750, lng: -89.3583,
                distritos: [
                    { nombre: "San Juan Opico", lat: 13.8753, lng: -89.3589 },
                    { nombre: "Ciudad Arce", lat: 13.8456, lng: -89.4483 }
                ]
            },
            {
                nombre: "La Libertad Oeste",
                lat: 13.7233, lng: -89.3578,
                distritos: [
                    { nombre: "Colón", lat: 13.7233, lng: -89.3578 },
                    { nombre: "Jayaque", lat: 13.6667, lng: -89.4167 },
                    { nombre: "Sacacoyo", lat: 13.7000, lng: -89.4500 },
                    { nombre: "Tepecoyo", lat: 13.7000, lng: -89.4333 },
                    { nombre: "Talnique", lat: 13.6667, lng: -89.3833 }
                ]
            },
            {
                nombre: "La Libertad Este",
                lat: 13.6769, lng: -89.2797,
                distritos: [
                    { nombre: "Antiguo Cuscatlán", lat: 13.6731, lng: -89.2469 },
                    { nombre: "Huizúcar", lat: 13.5917, lng: -89.2333 },
                    { nombre: "Nuevo Cuscatlán", lat: 13.6500, lng: -89.2667 },
                    { nombre: "San José Villanueva", lat: 13.5917, lng: -89.2667 },
                    { nombre: "Zaragoza", lat: 13.5917, lng: -89.2917 }
                ]
            },
            {
                nombre: "La Libertad Costa",
                lat: 13.4883, lng: -89.3222,
                distritos: [
                    { nombre: "Chiltiupán", lat: 13.5333, lng: -89.4167 },
                    { nombre: "Jicalapa", lat: 13.5333, lng: -89.4000 },
                    { nombre: "La Libertad", lat: 13.4883, lng: -89.3222 },
                    { nombre: "Tamanique", lat: 13.5667, lng: -89.4000 },
                    { nombre: "Teotepeque", lat: 13.5333, lng: -89.4833 }
                ]
            },
            {
                nombre: "La Libertad Sur",
                lat: 13.6769, lng: -89.2797,
                distritos: [
                    { nombre: "Santa Tecla", lat: 13.6769, lng: -89.2797 },
                    { nombre: "Comasagua", lat: 13.6333, lng: -89.3833 }
                ]
            }
        ]
    },
    {
        nombre: "Santa Ana",
        lat: 13.9942, lng: -89.5597,
        municipios: [
            {
                nombre: "Santa Ana Norte",
                lat: 14.3333, lng: -89.4500,
                distritos: [
                    { nombre: "Masahuat", lat: 14.1833, lng: -89.3833 },
                    { nombre: "Metapán", lat: 14.3333, lng: -89.4500 },
                    { nombre: "Santa Rosa Guachipilín", lat: 14.2000, lng: -89.4333 },
                    { nombre: "Texistepeque", lat: 14.1333, lng: -89.5000 }
                ]
            },
            {
                nombre: "Santa Ana Centro",
                lat: 13.9942, lng: -89.5597,
                distritos: [
                    { nombre: "Santa Ana", lat: 13.9942, lng: -89.5597 }
                ]
            },
            {
                nombre: "Santa Ana Este",
                lat: 13.9333, lng: -89.5000,
                distritos: [
                    { nombre: "Coatepeque", lat: 13.9333, lng: -89.5000 },
                    { nombre: "El Congo", lat: 13.9167, lng: -89.4667 }
                ]
            },
            {
                nombre: "Santa Ana Oeste",
                lat: 13.9833, lng: -89.6833,
                distritos: [
                    { nombre: "Candelaria de la Frontera", lat: 14.1167, lng: -89.6500 },
                    { nombre: "Chalchuapa", lat: 13.9833, lng: -89.6833 },
                    { nombre: "El Porvenir", lat: 14.0333, lng: -89.6167 },
                    { nombre: "San Antonio Pajonal", lat: 14.1667, lng: -89.5833 },
                    { nombre: "San Sebastián Salitrillo", lat: 14.0000, lng: -89.6500 },
                    { nombre: "Santiago de la Frontera", lat: 14.1667, lng: -89.6167 }
                ]
            }
        ]
    },
    {
        nombre: "Ahuachapán",
        lat: 13.9214, lng: -89.8450,
        municipios: [
            {
                nombre: "Ahuachapán Norte",
                lat: 13.9833, lng: -89.7500,
                distritos: [
                    { nombre: "Atiquizaya", lat: 13.9769, lng: -89.7525 },
                    { nombre: "El Refugio", lat: 13.9717, lng: -89.7117 },
                    { nombre: "San Lorenzo", lat: 14.0333, lng: -89.7833 },
                    { nombre: "Turín", lat: 13.9650, lng: -89.7633 }
                ]
            },
            {
                nombre: "Ahuachapán Centro",
                lat: 13.9214, lng: -89.8450,
                distritos: [
                    { nombre: "Ahuachapán", lat: 13.9214, lng: -89.8450 },
                    { nombre: "Apaneca", lat: 13.8606, lng: -89.8022 },
                    { nombre: "Concepción de Ataco", lat: 13.8711, lng: -89.8492 },
                    { nombre: "Tacuba", lat: 13.9000, lng: -89.9333 }
                ]
            },
            {
                nombre: "Ahuachapán Sur",
                lat: 13.7500, lng: -89.9833,
                distritos: [
                    { nombre: "Guaymango", lat: 13.7500, lng: -89.8500 },
                    { nombre: "Jujutla", lat: 13.7833, lng: -89.8667 },
                    { nombre: "San Francisco Menéndez", lat: 13.8333, lng: -90.0167 },
                    { nombre: "San Pedro Puxtla", lat: 13.7667, lng: -89.8000 }
                ]
            }
        ]
    },
    {
        nombre: "Sonsonate",
        lat: 13.7189, lng: -89.7242,
        municipios: [
            {
                nombre: "Sonsonate Norte",
                lat: 13.8167, lng: -89.7333,
                distritos: [
                    { nombre: "Juayúa", lat: 13.8433, lng: -89.7628 },
                    { nombre: "Nahuizalco", lat: 13.7833, lng: -89.7333 },
                    { nombre: "Salcoatitán", lat: 13.8333, lng: -89.7500 },
                    { nombre: "Santa Catarina Masahuat", lat: 13.7833, lng: -89.7500 }
                ]
            },
            {
                nombre: "Sonsonate Centro",
                lat: 13.7189, lng: -89.7242,
                distritos: [
                    { nombre: "Sonsonate", lat: 13.7189, lng: -89.7242 },
                    { nombre: "Sonzacate", lat: 13.7333, lng: -89.7167 },
                    { nombre: "Nahulingo", lat: 13.7167, lng: -89.7333 },
                    { nombre: "San Antonio del Monte", lat: 13.7333, lng: -89.7333 },
                    { nombre: "Santo Domingo de Guzmán", lat: 13.7167, lng: -89.7667 }
                ]
            },
            {
                nombre: "Sonsonate Este",
                lat: 13.7500, lng: -89.6667,
                distritos: [
                    { nombre: "Izalco", lat: 13.7500, lng: -89.6667 },
                    { nombre: "Armenia", lat: 13.7500, lng: -89.5000 },
                    { nombre: "Caluco", lat: 13.7333, lng: -89.6667 },
                    { nombre: "San Julián", lat: 13.7000, lng: -89.5667 },
                    { nombre: "Cuisnahuat", lat: 13.6667, lng: -89.6167 },
                    { nombre: "Santa Isabel Ishuatán", lat: 13.6167, lng: -89.5833 }
                ]
            },
            {
                nombre: "Sonsonate Oeste",
                lat: 13.5928, lng: -89.8275,
                distritos: [
                    { nombre: "Acajutla", lat: 13.5928, lng: -89.8275 }
                ]
            }
        ]
    },
    {
        nombre: "Chalatenango",
        lat: 14.0333, lng: -88.9333,
        municipios: [
            {
                nombre: "Chalatenango Norte",
                lat: 14.3167, lng: -89.1333,
                distritos: [
                    { nombre: "La Palma", lat: 14.3167, lng: -89.1333 },
                    { nombre: "Citalá", lat: 14.3667, lng: -89.2167 },
                    { nombre: "San Ignacio", lat: 14.3333, lng: -89.1833 }
                ]
            },
            {
                nombre: "Chalatenango Centro",
                lat: 14.1333, lng: -89.2833,
                distritos: [
                    { nombre: "Nueva Concepción", lat: 14.1333, lng: -89.2833 },
                    { nombre: "Tejutla", lat: 14.2000, lng: -89.1167 },
                    { nombre: "La Reina", lat: 14.1833, lng: -89.2000 },
                    { nombre: "Agua Caliente", lat: 14.2000, lng: -89.2333 },
                    { nombre: "Dulce Nombre de María", lat: 14.1667, lng: -89.0000 },
                    { nombre: "El Paraíso", lat: 14.0667, lng: -89.0167 },
                    { nombre: "San Francisco Morazán", lat: 14.1833, lng: -89.0500 },
                    { nombre: "San Rafael", lat: 14.1333, lng: -89.0333 },
                    { nombre: "Santa Rita", lat: 14.1167, lng: -89.0000 },
                    { nombre: "San Fernando", lat: 14.3167, lng: -89.0167 }
                ]
            },
            {
                nombre: "Chalatenango Sur",
                lat: 14.0333, lng: -88.9333,
                distritos: [
                    { nombre: "Chalatenango", lat: 14.0333, lng: -88.9333 },
                    { nombre: "Arcatao", lat: 14.1000, lng: -88.7667 },
                    { nombre: "Azacualpa", lat: 13.9667, lng: -88.9667 },
                    { nombre: "Comalapa", lat: 14.1333, lng: -88.9667 },
                    { nombre: "Concepción Quezaltepeque", lat: 14.1000, lng: -88.9667 },
                    { nombre: "El Carrizal", lat: 14.1167, lng: -88.9167 },
                    { nombre: "La Laguna", lat: 14.1167, lng: -88.9333 },
                    { nombre: "Las Vueltas", lat: 14.0833, lng: -88.9000 },
                    { nombre: "Nombre de Jesús", lat: 14.0000, lng: -88.7333 },
                    { nombre: "Ojos de Agua", lat: 14.1500, lng: -88.9167 },
                    { nombre: "Potonico", lat: 14.0000, lng: -88.9333 },
                    { nombre: "San Antonio de la Cruz", lat: 14.0333, lng: -88.8167 },
                    { nombre: "San Antonio Los Ranchos", lat: 14.0500, lng: -88.9333 },
                    { nombre: "San Francisco Lempa", lat: 14.0167, lng: -88.9500 },
                    { nombre: "San Isidro Labrador", lat: 14.0000, lng: -88.8667 },
                    { nombre: "San José Cancasque", lat: 14.0167, lng: -88.9333 },
                    { nombre: "San José Las Flores", lat: 14.0667, lng: -88.8500 },
                    { nombre: "San Luis del Carmen", lat: 14.0667, lng: -88.9667 },
                    { nombre: "San Miguel de Mercedes", lat: 14.0333, lng: -88.9833 },
                    { nombre: "San Isidro", lat: 13.9667, lng: -88.8333 }
                ]
            }
        ]
    },
    {
        nombre: "Cuscatlán",
        lat: 13.7167, lng: -88.9833,
        municipios: [
            {
                nombre: "Cuscatlán Norte",
                lat: 13.9333, lng: -89.0167,
                distritos: [
                    { nombre: "Suchitoto", lat: 13.9333, lng: -89.0167 },
                    { nombre: "San José Guayabal", lat: 13.8667, lng: -89.1000 },
                    { nombre: "Oratorio de Concepción", lat: 13.8500, lng: -89.0333 },
                    { nombre: "San Bartolomé Perulapía", lat: 13.8333, lng: -89.0667 },
                    { nombre: "San Pedro Perulapán", lat: 13.8167, lng: -89.0333 }
                ]
            },
            {
                nombre: "Cuscatlán Sur",
                lat: 13.7167, lng: -88.9333,
                distritos: [
                    { nombre: "Cojutepeque", lat: 13.7167, lng: -88.9333 },
                    { nombre: "San Rafael Cedros", lat: 13.7333, lng: -88.8833 },
                    { nombre: "Candelaria", lat: 13.7000, lng: -88.9667 },
                    { nombre: "El Carmen", lat: 13.7167, lng: -88.9000 },
                    { nombre: "El Rosario", lat: 13.7333, lng: -89.0000 },
                    { nombre: "Monte San Juan", lat: 13.7167, lng: -88.9667 },
                    { nombre: "San Cristóbal", lat: 13.7333, lng: -88.9333 },
                    { nombre: "San Ramón", lat: 13.7000, lng: -88.9167 },
                    { nombre: "Santa Cruz Analquito", lat: 13.6833, lng: -88.9500 },
                    { nombre: "Santa Cruz Michapa", lat: 13.7333, lng: -88.9500 },
                    { nombre: "Tenancingo", lat: 13.8167, lng: -88.9833 }
                ]
            }
        ]
    },
    {
        nombre: "La Paz",
        lat: 13.5000, lng: -88.8667,
        municipios: [
            {
                nombre: "La Paz Oeste",
                lat: 13.5000, lng: -89.1000,
                distritos: [
                    { nombre: "Olocuilta", lat: 13.5667, lng: -89.1167 },
                    { nombre: "San Francisco Chinameca", lat: 13.6167, lng: -89.0333 },
                    { nombre: "San Juan Talpa", lat: 13.5000, lng: -89.0833 },
                    { nombre: "San Luis Talpa", lat: 13.4833, lng: -89.0833 },
                    { nombre: "San Pedro Masahuat", lat: 13.5333, lng: -89.0500 },
                    { nombre: "Tapalhuaca", lat: 13.6000, lng: -89.0333 },
                    { nombre: "Cuyultitán", lat: 13.5500, lng: -89.1000 }
                ]
            },
            {
                nombre: "La Paz Centro",
                lat: 13.4833, lng: -88.8833,
                distritos: [
                    { nombre: "Santiago Nonualco", lat: 13.5167, lng: -88.8833 },
                    { nombre: "San Pedro Nonualco", lat: 13.5667, lng: -88.9167 },
                    { nombre: "Santa María Ostuma", lat: 13.6000, lng: -88.9333 },
                    { nombre: "San Juan Tepezontes", lat: 13.6167, lng: -89.0000 },
                    { nombre: "San Miguel Tepezontes", lat: 13.6333, lng: -89.0167 },
                    { nombre: "El Rosario", lat: 13.5000, lng: -88.9500 },
                    { nombre: "San Antonio Masahuat", lat: 13.5333, lng: -89.0000 },
                    { nombre: "San Emigdio", lat: 13.6333, lng: -88.9500 },
                    { nombre: "Paraíso de Osorio", lat: 13.6333, lng: -88.9500 },
                    { nombre: "Jerusalén", lat: 13.6333, lng: -88.9167 },
                    { nombre: "Mercedes La Ceiba", lat: 13.6167, lng: -88.9167 },
                    { nombre: "San Luis La Herradura", lat: 13.3500, lng: -88.9667 }
                ]
            },
            {
                nombre: "La Paz Este",
                lat: 13.5000, lng: -88.8667,
                distritos: [
                    { nombre: "Zacatecoluca", lat: 13.5000, lng: -88.8667 },
                    { nombre: "San Juan Nonualco", lat: 13.5167, lng: -88.9000 },
                    { nombre: "San Rafael Obrajuelo", lat: 13.5333, lng: -88.8833 }
                ]
            }
        ]
    },
    {
        nombre: "Cabañas",
        lat: 13.8667, lng: -88.7500,
        municipios: [
            {
                nombre: "Cabañas Este",
                lat: 13.8667, lng: -88.6333,
                distritos: [
                    { nombre: "Sensuntepeque", lat: 13.8667, lng: -88.6333 },
                    { nombre: "Victoria", lat: 13.9500, lng: -88.6333 },
                    { nombre: "Dolores", lat: 13.7833, lng: -88.5667 },
                    { nombre: "Guacotecti", lat: 13.8667, lng: -88.6500 },
                    { nombre: "San Isidro", lat: 13.8333, lng: -88.7167 }
                ]
            },
            {
                nombre: "Cabañas Oeste",
                lat: 13.8333, lng: -88.8500,
                distritos: [
                    { nombre: "Ilobasco", lat: 13.8333, lng: -88.8500 },
                    { nombre: "Tejutepeque", lat: 13.8833, lng: -88.9000 },
                    { nombre: "Jutiapa", lat: 13.9000, lng: -88.8833 },
                    { nombre: "Cinquera", lat: 13.8833, lng: -89.0000 }
                ]
            }
        ]
    },
    {
        nombre: "San Vicente",
        lat: 13.6333, lng: -88.7833,
        municipios: [
            {
                nombre: "San Vicente Norte",
                lat: 13.6667, lng: -88.8000,
                distritos: [
                    { nombre: "Apastepeque", lat: 13.6667, lng: -88.8000 },
                    { nombre: "Santa Clara", lat: 13.7000, lng: -88.7833 },
                    { nombre: "San Ildefonso", lat: 13.7000, lng: -88.6667 },
                    { nombre: "San Esteban Catarina", lat: 13.7000, lng: -88.8167 },
                    { nombre: "San Sebastián", lat: 13.7167, lng: -88.8333 },
                    { nombre: "San Lorenzo", lat: 13.7167, lng: -88.8000 },
                    { nombre: "Santo Domingo", lat: 13.7167, lng: -88.8500 }
                ]
            },
            {
                nombre: "San Vicente Sur",
                lat: 13.6333, lng: -88.7833,
                distritos: [
                    { nombre: "San Vicente", lat: 13.6333, lng: -88.7833 },
                    { nombre: "Guadalupe", lat: 13.6167, lng: -88.8833 },
                    { nombre: "Tepetitán", lat: 13.6333, lng: -88.8500 },
                    { nombre: "Verapaz", lat: 13.6333, lng: -88.8667 },
                    { nombre: "Tecoluca", lat: 13.5333, lng: -88.7833 },
                    { nombre: "San Cayetano Istepeque", lat: 13.6500, lng: -88.8167 }
                ]
            }
        ]
    },
    {
        nombre: "Usulután",
        lat: 13.3500, lng: -88.4500,
        municipios: [
            {
                nombre: "Usulután Norte",
                lat: 13.4833, lng: -88.4667,
                distritos: [
                    { nombre: "Santiago de María", lat: 13.4833, lng: -88.4667 },
                    { nombre: "Alegría", lat: 13.5000, lng: -88.4833 },
                    { nombre: "Berlín", lat: 13.5000, lng: -88.5333 },
                    { nombre: "Mercedes Umaña", lat: 13.5500, lng: -88.4667 },
                    { nombre: "Jucuapa", lat: 13.5167, lng: -88.3833 },
                    { nombre: "El Triunfo", lat: 13.5667, lng: -88.4333 },
                    { nombre: "Estanzuelas", lat: 13.5667, lng: -88.5000 },
                    { nombre: "San Buenaventura", lat: 13.5333, lng: -88.4333 },
                    { nombre: "Nueva Granada", lat: 13.6000, lng: -88.4833 }
                ]
            },
            {
                nombre: "Usulután Este",
                lat: 13.3500, lng: -88.4500,
                distritos: [
                    { nombre: "Usulután", lat: 13.3500, lng: -88.4500 },
                    { nombre: "Jucuarán", lat: 13.2167, lng: -88.3167 },
                    { nombre: "San Dionisio", lat: 13.3000, lng: -88.5000 },
                    { nombre: "Concepción Batres", lat: 13.3500, lng: -88.3667 },
                    { nombre: "Santa María", lat: 13.3333, lng: -88.4500 },
                    { nombre: "Ozatlán", lat: 13.3833, lng: -88.5000 },
                    { nombre: "Tecapán", lat: 13.4333, lng: -88.4833 },
                    { nombre: "Santa Elena", lat: 13.3833, lng: -88.4000 },
                    { nombre: "California", lat: 13.4500, lng: -88.4667 },
                    { nombre: "Ereguayquín", lat: 13.3333, lng: -88.4167 }
                ]
            },
            {
                nombre: "Usulután Oeste",
                lat: 13.3167, lng: -88.5833,
                distritos: [
                    { nombre: "Jiquilisco", lat: 13.3167, lng: -88.5833 },
                    { nombre: "Puerto El Triunfo", lat: 13.2833, lng: -88.5500 },
                    { nombre: "San Agustín", lat: 13.4333, lng: -88.5833 },
                    { nombre: "San Francisco Javier", lat: 13.4500, lng: -88.5667 }
                ]
            }
        ]
    },
    {
        nombre: "San Miguel",
        lat: 13.4833, lng: -88.1833,
        municipios: [
            {
                nombre: "San Miguel Norte",
                lat: 13.7667, lng: -88.2667,
                distritos: [
                    { nombre: "Ciudad Barrios", lat: 13.7667, lng: -88.2667 },
                    { nombre: "Sesori", lat: 13.7167, lng: -88.3667 },
                    { nombre: "Nuevo Edén de San Juan", lat: 13.8000, lng: -88.2833 },
                    { nombre: "San Gerardo", lat: 13.8000, lng: -88.4000 },
                    { nombre: "San Luis de la Reina", lat: 13.8000, lng: -88.3167 },
                    { nombre: "Carolina", lat: 13.8500, lng: -88.3333 },
                    { nombre: "San Antonio del Mosco", lat: 13.8667, lng: -88.2500 },
                    { nombre: "Chapeltique", lat: 13.6667, lng: -88.2667 }
                ]
            },
            {
                nombre: "San Miguel Centro",
                lat: 13.4833, lng: -88.1833,
                distritos: [
                    { nombre: "San Miguel", lat: 13.4833, lng: -88.1833 },
                    { nombre: "Comacarán", lat: 13.5500, lng: -88.1000 },
                    { nombre: "Uluazapa", lat: 13.5167, lng: -88.0500 },
                    { nombre: "Moncagua", lat: 13.5333, lng: -88.2500 },
                    { nombre: "Quelepa", lat: 13.5333, lng: -88.2333 },
                    { nombre: "Chirilagua", lat: 13.2667, lng: -88.1333 }
                ]
            },
            {
                nombre: "San Miguel Oeste",
                lat: 13.5167, lng: -88.3500,
                distritos: [
                    { nombre: "Chinameca", lat: 13.5167, lng: -88.3500 },
                    { nombre: "Nueva Guadalupe", lat: 13.5333, lng: -88.3500 },
                    { nombre: "Lolotique", lat: 13.5500, lng: -88.3333 },
                    { nombre: "San Jorge", lat: 13.4167, lng: -88.3333 },
                    { nombre: "San Rafael Oriente", lat: 13.3667, lng: -88.3333 },
                    { nombre: "El Tránsito", lat: 13.3500, lng: -88.4500 }
                ]
            }
        ]
    },
    {
        nombre: "Morazán",
        lat: 13.7667, lng: -88.1000,
        municipios: [
            {
                nombre: "Morazán Norte",
                lat: 13.9333, lng: -88.1000,
                distritos: [
                    { nombre: "Perquín", lat: 13.9667, lng: -88.1667 },
                    { nombre: "Arambala", lat: 13.9333, lng: -88.1000 },
                    { nombre: "Cacaopera", lat: 13.7667, lng: -88.0833 },
                    { nombre: "Corinto", lat: 13.8167, lng: -87.9667 },
                    { nombre: "El Rosario", lat: 13.9000, lng: -88.0667 },
                    { nombre: "Joateca", lat: 13.9167, lng: -88.0167 },
                    { nombre: "Jocoaitique", lat: 13.9167, lng: -88.0833 },
                    { nombre: "Meanguera", lat: 13.8833, lng: -88.1167 },
                    { nombre: "San Fernando", lat: 13.9667, lng: -88.2000 },
                    { nombre: "San Isidro", lat: 13.8500, lng: -88.2333 },
                    { nombre: "Torola", lat: 13.9333, lng: -88.2333 }
                ]
            },
            {
                nombre: "Morazán Sur",
                lat: 13.7000, lng: -88.1000,
                distritos: [
                    { nombre: "San Francisco Gotera", lat: 13.7000, lng: -88.1000 },
                    { nombre: "Chilanga", lat: 13.7167, lng: -88.1167 },
                    { nombre: "Delicias de Concepción", lat: 13.6833, lng: -88.1500 },
                    { nombre: "El Divisadero", lat: 13.6000, lng: -88.0667 },
                    { nombre: "Gualococti", lat: 13.6500, lng: -88.1667 },
                    { nombre: "Guatajiagua", lat: 13.6667, lng: -88.2000 },
                    { nombre: "Jocoro", lat: 13.6167, lng: -88.0333 },
                    { nombre: "Lolotiquillo", lat: 13.7167, lng: -88.1667 },
                    { nombre: "Osicala", lat: 13.7000, lng: -88.1500 },
                    { nombre: "San Carlos", lat: 13.6500, lng: -88.0833 },
                    { nombre: "San Simón", lat: 13.8333, lng: -88.2167 },
                    { nombre: "Sensembra", lat: 13.6667, lng: -88.1833 },
                    { nombre: "Sociedad", lat: 13.7000, lng: -88.0000 },
                    { nombre: "Yamabal", lat: 13.6833, lng: -88.2167 },
                    { nombre: "Yoloaiquín", lat: 13.6667, lng: -88.1333 }
                ]
            }
        ]
    },
    {
        nombre: "La Unión",
        lat: 13.3333, lng: -87.8333,
        municipios: [
            {
                nombre: "La Unión Norte",
                lat: 13.6500, lng: -87.9000,
                distritos: [
                    { nombre: "Santa Rosa de Lima", lat: 13.6167, lng: -87.8833 },
                    { nombre: "Anamorós", lat: 13.7333, lng: -87.8667 },
                    { nombre: "Bolívar", lat: 13.6500, lng: -87.9500 },
                    { nombre: "Concepción de Oriente", lat: 13.8000, lng: -87.7000 },
                    { nombre: "El Sauce", lat: 13.6667, lng: -87.7833 },
                    { nombre: "Lislique", lat: 13.8000, lng: -87.9167 },
                    { nombre: "Nueva Esparta", lat: 13.7833, lng: -87.8333 },
                    { nombre: "Pasaquina", lat: 13.5833, lng: -87.8333 },
                    { nombre: "Polorós", lat: 13.7833, lng: -87.8000 },
                    { nombre: "San José", lat: 13.6000, lng: -87.9667 }
                ]
            },
            {
                nombre: "La Unión Sur",
                lat: 13.3333, lng: -87.8333,
                distritos: [
                    { nombre: "La Unión", lat: 13.3333, lng: -87.8333 },
                    { nombre: "Conchagua", lat: 13.3000, lng: -87.8667 },
                    { nombre: "El Carmen", lat: 13.3500, lng: -88.0000 },
                    { nombre: "Intipucá", lat: 13.2000, lng: -88.0500 },
                    { nombre: "Meanguera del Golfo", lat: 13.1833, lng: -87.7833 },
                    { nombre: "San Alejo", lat: 13.4333, lng: -87.9667 },
                    { nombre: "Yayantique", lat: 13.4333, lng: -88.0333 },
                    { nombre: "Yucuaiquín", lat: 13.5500, lng: -88.0167 }
                ]
            }
        ]
    }
];