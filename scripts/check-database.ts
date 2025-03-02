// Script para verificar la conexión a la base de datos
// Para ejecutar: npx ts-node scripts/check-database.ts

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Primero cargar variables de entorno
dotenv.config({ path: '.env.local' });
dotenv.config(); // También cargar el .env por defecto

// Función para guardar los logs en un archivo
function saveToLogFile(message: string) {
  const logDir = path.join(__dirname, '../logs');
  
  // Crear directorio de logs si no existe
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logPath = path.join(logDir, `db-check-${timestamp}.log`);
  
  // Agregar un timestamp a cada línea
  const logWithTimestamp = `[${new Date().toISOString()}] ${message}`;
  
  // Guardar en archivo
  fs.writeFileSync(logPath, logWithTimestamp);
  
  console.log(`✅ Log guardado en: ${logPath}`);
}

// Función para imprimir y registrar
function log(message: string, isError = false) {
  const formattedMessage = isError 
    ? `❌ ERROR: ${message}` 
    : message;
  
  console.log(formattedMessage);
  return formattedMessage;
}

async function checkDatabase() {
  let logMessages: string[] = [];
  
  // Verificar variables de entorno
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    const errorMsg = log('Variables de entorno faltantes. Asegúrate de tener .env o .env.local configurado correctamente.', true);
    logMessages.push(errorMsg);
    
    // Mostrar las variables disponibles
    logMessages.push(log(`NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? 'Configurado ✓' : 'No configurado ✗'}`));
    logMessages.push(log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey ? 'Configurado ✓' : 'No configurado ✗'}`));
    
    // Verificar archivo .env
    const envPath = path.join(__dirname, '../.env');
    const envLocalPath = path.join(__dirname, '../.env.local');
    
    logMessages.push(log(`Archivo .env: ${fs.existsSync(envPath) ? 'Existe ✓' : 'No existe ✗'}`));
    logMessages.push(log(`Archivo .env.local: ${fs.existsSync(envLocalPath) ? 'Existe ✓' : 'No existe ✗'}`));
    
    saveToLogFile(logMessages.join('\n'));
    return;
  }

  logMessages.push(log('🔍 Verificando conexión a la base de datos...'));
  logMessages.push(log(`📡 URL de Supabase: ${supabaseUrl}`));

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Verificar autenticación
    logMessages.push(log('🔑 Verificando autenticación anónima...'));
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      logMessages.push(log(`❌ Error de autenticación: ${authError.message}`, true));
    } else {
      logMessages.push(log(`✅ Cliente de Supabase inicializado correctamente`));
      logMessages.push(log(`🔒 Sesión: ${authData.session ? 'Activa' : 'Inactiva'}`));
    }
    
    // Verificar si existe la tabla analysis_results
    logMessages.push(log('📋 Verificando tabla analysis_results...'));
    
    try {
      const { data: tableData, error: tableError } = await supabase
        .from('analysis_results')
        .select('id')
        .limit(1);
      
      if (tableError) {
        if (tableError.code === '42P01') {
          // Tabla no existe
          logMessages.push(log(`❌ La tabla analysis_results no existe`, true));
        } else {
          logMessages.push(log(`❌ Error al acceder a la tabla: ${tableError.message}`, true));
          logMessages.push(log(`   Código: ${tableError.code}`, true));
          logMessages.push(log(`   Detalles: ${JSON.stringify(tableError.details)}`, true));
        }
      } else {
        logMessages.push(log(`✅ Tabla analysis_results accesible`));
        logMessages.push(log(`📊 Registros encontrados: ${tableData?.length || 0}`));
      }
    } catch (err) {
      logMessages.push(log(`❌ Error al verificar tabla: ${err}`, true));
    }
    
    // Verificar estructura de la tabla
    logMessages.push(log('🔍 Verificando estructura de la tabla...'));
    
    try {
      // Esta consulta fallará si la tabla no existe, por lo que está dentro de un try/catch
      const { data: columnsData, error: columnsError } = await supabase.rpc(
        'get_table_columns',
        { table_name: 'analysis_results' }
      );
      
      if (columnsError) {
        logMessages.push(log(`❌ Error al obtener columnas: ${columnsError.message}`, true));
      } else if (columnsData && Array.isArray(columnsData)) {
        logMessages.push(log(`✅ Estructura de la tabla obtenida:`));
        columnsData.forEach(column => {
          logMessages.push(log(`   - ${column.column_name}: ${column.data_type} (${column.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`));
        });
      }
    } catch (err) {
      logMessages.push(log(`❌ Error al verificar estructura: ${err}`, true));
    }
    
    // Verificar permisos RLS
    logMessages.push(log('🔒 Verificando políticas RLS...'));
    
    try {
      const { data: policiesData, error: policiesError } = await supabase.rpc(
        'get_policies',
        { table_name: 'analysis_results' }
      );
      
      if (policiesError) {
        logMessages.push(log(`❌ Error al obtener políticas: ${policiesError.message}`, true));
      } else if (policiesData && Array.isArray(policiesData)) {
        logMessages.push(log(`✅ Políticas RLS encontradas: ${policiesData.length}`));
        policiesData.forEach(policy => {
          logMessages.push(log(`   - ${policy.policyname}: ${policy.permissive} (${policy.cmd})`));
        });
      } else {
        logMessages.push(log(`⚠️ No se encontraron políticas RLS para la tabla`));
      }
    } catch (err) {
      logMessages.push(log(`❌ Error al verificar políticas RLS: ${err}`, true));
    }
    
    // Verificar permiso de inserción
    logMessages.push(log('✏️ Realizando prueba de inserción...'));
    
    try {
      // Intentar una inserción de prueba con datos mínimos (se eliminará después)
      const testData = {
        user_id: '00000000-0000-0000-0000-000000000000', // UUID ficticio
        conversation: 'Test conversation',
        strengths: JSON.stringify(['Test strength']),
        weaknesses: JSON.stringify(['Test weakness']),
        tips: JSON.stringify(['Test tip']),
        overall: 'Test overall',
        score: 5
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('analysis_results')
        .insert([testData])
        .select();
      
      if (insertError) {
        if (insertError.code === '23503') {
          logMessages.push(log(`⚠️ Error de clave foránea: ${insertError.message}`, true));
          logMessages.push(log('   Esto es normal si estás usando un UUID ficticio', false));
        } else {
          logMessages.push(log(`❌ Error al insertar: ${insertError.message}`, true));
          logMessages.push(log(`   Código: ${insertError.code}`, true));
          logMessages.push(log(`   Detalles: ${JSON.stringify(insertError.details)}`, true));
        }
      } else {
        logMessages.push(log(`✅ Inserción de prueba exitosa`));
        logMessages.push(log(`   ID generado: ${insertData[0]?.id}`));
        
        // Eliminar el registro de prueba
        if (insertData[0]?.id) {
          const { error: deleteError } = await supabase
            .from('analysis_results')
            .delete()
            .eq('id', insertData[0].id);
          
          if (deleteError) {
            logMessages.push(log(`⚠️ No se pudo eliminar el registro de prueba: ${deleteError.message}`));
          } else {
            logMessages.push(log(`✅ Registro de prueba eliminado correctamente`));
          }
        }
      }
    } catch (err) {
      logMessages.push(log(`❌ Error en la prueba de inserción: ${err}`, true));
    }
    
  } catch (error) {
    logMessages.push(log(`❌ Error al conectar con Supabase: ${error}`, true));
  }
  
  // Guardar el log completo
  saveToLogFile(logMessages.join('\n'));
}

// Ejecutar la función principal
console.log('🚀 Iniciando verificación de la base de datos...');
checkDatabase()
  .then(() => console.log('✅ Verificación completada'))
  .catch(err => console.error('❌ Error en la verificación:', err));
