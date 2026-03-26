# Practica3 - Film Rentals

[![Video Demo](https://img.shields.io/badge/Video-Demostraci%C3%B3n-red?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/watch?v=n0crzx8SAa0&t=3s)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![AWS](https://img.shields.io/badge/Amazon_AWS-FF9900?style=for-the-badge&logo=amazonwebservices&logoColor=white)](https://aws.amazon.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Step Functions](https://img.shields.io/badge/AWS-Step_Functions-F58536?style=for-the-badge&logo=amazonaws&logoColor=white)](https://aws.amazon.com/step-functions/)


---

## Descripción del Proyecto
Este sistema moderniza la operación de una tienda de películas utilizando una arquitectura **orientada a eventos (Event-Driven)**. El proyecto resuelve desafíos críticos de concurrencia y reglas de negocio mediante el uso de orquestadores de estado y servicios administrados.

### Reglas de Negocio Implementadas
* **Plazo de Renta:** Vigencia estricta de 1 semana (7 días) por película.
* **Control de Usuario:** Restricción de máximo 2 rentas activas simultáneas.
* **Alertas Automatizadas:** Notificaciones diarias vía email cuando faltan 3 días o menos para el vencimiento.

---

## Arquitectura en AWS
El sistema implementa un ecosistema desacoplado utilizando los siguientes servicios:

1. **Amazon API Gateway:** Exposición de endpoints RESTful para búsqueda y transacciones.
2. **AWS Step Functions:** Orquestación de la máquina de estados para el flujo de renta asíncrono.
3. **AWS Lambda:** Lógica de negocio, validaciones y ejecución de tareas programadas.
4. **Amazon RDS (PostgreSQL):** Base de datos relacional para el catálogo MovieLens y registros de usuario.
5. **AWS Secrets Manager:** Inyección segura de credenciales de DB hacia el entorno de ejecución.
6. **Amazon SNS:** Sistema de mensajería con **Filter Policies** para notificaciones personalizadas.
7. **Amazon EventBridge:** Disparador temporal (*cron*) para el ciclo de vida de las alertas.

## Diagrama
<p align="left">
  <img src="https://imgur.com/YunAhQr.png" alt="Arquitectura" width="800"/>
</p>


---

## Setup e Infraestructura
El aprovisionamiento se realizó mediante un flujo técnico riguroso:

1. **Seguridad:** Configuración de secretos en Secrets Manager para eliminar cualquier *hardcoding*.
2. **Gestión de Datos:** * Conexión a RDS desde una instancia EC2 dedicada mediante `psql`.
   * Carga masiva del dataset MovieLens (~9,000 registros).
   * Creación de esquema relacional (`movies`, `rentals`, `users`).
3. **Población:** Ejecución de `insert_fake_users.sh` para registrar a los usuarios de prueba.

---

## Endpoints y Flujos

### Búsqueda (`GET /movies`)
Filtra el catálogo por nombre y verifica en tiempo real la disponibilidad de cada título cruzando datos con la tabla de rentas.

### Orquestador de Renta (`POST /rent`)
Invoca una **Step Function** que ejecuta de forma atómica:
`CheckMovieExists` ➔ `CheckMovieAvailable` ➔ `CheckUserLimit` ➔ `CreateRental`.

### Sistema de Alertas
Una regla de **EventBridge** activa diariamente una Lambda de inspección. Esta publica en **SNS** incluyendo `MessageAttributes`, permitiendo que las **Filter Policies** entreguen el correo solo al usuario correspondiente.

---

## Evidencia de Pruebas

<details>
<summary><b>Seguridad (Secrets Manager)</b></summary>
<p align="center">
  <img src="https://imgur.com/T0Kwj9J.png" alt="Secrets Manager" width="700"/>
</p>
</details>

<details>
<summary><b>Base de datos</b></summary>
<p align="center">
  <img src="https://imgur.com/OCCKM2A.png" alt="RDS" width="700"/>
</p>
</details>

<details>
<summary><b>Lambdas</b></summary>
<p align="center">
  <img src="https://imgur.com/lZcL3Od.png" alt="Lambdas" width="700"/>
</p>
</details>

<details>
<summary><b>API GATEWAY</b></summary>
<p align="center">
  <img src="https://imgur.com/G9gOdR7.png" alt="API endpoints" width="200"/>
</p>
</details>

<details>
<summary><b>SNS</b></summary>
<p align="center">
  <img src="https://imgur.com/vNHsn1A.png" alt="SNS" width="500"/>
</p>
</details>

<details>
<summary><b>EventBrige</b></summary>
<p align="center">
  <img src="https://imgur.com/prFprhD.png" alt="EventBridge Config" width="500"/>
</p>
</details>

<details>
<summary><b>Flujo Exitoso (Step Functions)</b></summary>
<p align="center">
  <img src="https://imgur.com/OWwMLhw.png" alt="Step Function Success" width="700"/>
</p>
</details>

<details>
<summary><b>Validación de Errores (Step Functions)</b></summary>
<p align="center">
  <img src="https://imgur.com/Th4nJm4.png" alt="Step Function Error" width="700"/>
</p>
</details>

<details>
<summary><b>Notificación Real (SNS Email)</b></summary>
<p align="center">
  <img src="https://imgur.com/scOaF2L.png" alt="Email Notification" width="500"/>
</p>
</details>

---

## Instrucciones de Despliegue

Sigue este orden para replicar el entorno en una cuenta de AWS nueva:

### 1. Infraestructura de Base de Datos
1. Crear una instancia **RDS PostgreSQL** (pública o accesible desde EC2).
2. Crear los secretos en **AWS Secrets Manager**:
   * `filmrentals/rds/host`: El endpoint de tu RDS.
   * `filmrentals/rds/credentials`: JSON con `username` y `password`.

---

### 2. Configuración de Tablas y Datos
Desde una instancia EC2 con `psql` instalado, ejecuta los scripts de la carpeta `infra/scripts/`:

```bash
# 1. Crear tablas y cargar CSV de películas
psql -h <RDS_ENDPOINT> -U postgres -f infra/scripts/setup_db.sql

# 2. Insertar usuarios de prueba (Editar correos antes de correr)
bash infra/scripts/insert_fake_users.sh
```

---

### 3. Despliegue de Lógica (Lambdas y Step Functions)

**Lambdas:**
- Sube el código de `src/` a funciones Lambda individuales.
- Asigna el IAM Role `LabRole`.

**Step Function:**
- Crea la máquina de estados en AWS usando `infra/state-machine.json`.

---

### 4. Configuración de Mensajería (SNS)

1. Crea el tópico `rentals-expiring-soon`.
2. Crea suscripciones tipo Email.
3. Configura la **Subscription Filter Policy**:

```json
{ "user_id": ["1"] }
```

---

### 5. Exposición de API (API Gateway)

1. Crea una REST API.
2. Crea recursos:
   - `/movies`
   - `/status`
   - `/rent`
3. En `/rent` (POST):
   - Integra con Step Functions
   - Agrega Mapping Template con ARN de la state machine
4. Haz deploy a etapa `prod`.

---

### 6. Automatización de Alertas (EventBridge)

1. Crea una regla tipo **Schedule**
2. Define frecuencia (ej: `rate(1 day)`)
3. Usa la Lambda `notifyExpiring` como destino
