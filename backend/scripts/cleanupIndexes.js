//JALANKAN node scripts/cleanupIndexes.js KALAU SEQUELIZE MELEBIHI 64 INDEX (terjadi krn Sequelize + alter: true sehingga ketika restart server bisa buat indeks banyak utk constraint yang sama)

import db from '../config/db.js';
import { QueryTypes } from 'sequelize';

async function cleanupUserIndexes() {
    try {
        console.log('🔧 Starting index cleanup for ms_user table...');
        
        const indexes = await db.query(
            `SHOW INDEX FROM ms_user WHERE Key_name != 'PRIMARY'`,
            { type: QueryTypes.SELECT }
        );
        
        console.log(`📊 Found ${indexes.length} non-primary indexes`);
        
        const indexGroups = {};
        indexes.forEach(index => {
            if (!indexGroups[index.Key_name]) {
                indexGroups[index.Key_name] = [];
            }
            indexGroups[index.Key_name].push(index);
        });
        
        const indexesToRemove = [];
        
        for (const [indexName, indexColumns] of Object.entries(indexGroups)) {
            console.log(`   - ${indexName}: ${indexColumns.length} column(s)`);
            
            if (indexName.includes('username') && indexColumns.length > 1) {
                console.log(`     ⚠️  Multiple username indexes found`);
                for (let i = 1; i < indexColumns.length; i++) {
                    indexesToRemove.push(indexName);
                }
            }
            
            if (indexName.includes('email') && indexColumns.length > 1) {
                console.log(`     ⚠️  Multiple email indexes found`);
                for (let i = 1; i < indexColumns.length; i++) {
                    indexesToRemove.push(indexName);
                }
            }
            
            if (indexName.startsWith('ms_user_') && indexName !== 'ms_user_username' && indexName !== 'ms_user_email') {
                console.log(`     ⚠️  Auto-generated index: ${indexName}`);
                indexesToRemove.push(indexName);
            }
        }
        
        const uniqueIndexesToRemove = [...new Set(indexesToRemove)];
        
        if (uniqueIndexesToRemove.length === 0) {
            console.log('✅ No duplicate indexes found to remove');
            return;
        }
        
        console.log(`🗑️  Removing ${uniqueIndexesToRemove.length} duplicate indexes...`);
        
        for (const indexName of uniqueIndexesToRemove) {
            try {
                await db.query(`DROP INDEX \`${indexName}\` ON ms_user`);
                console.log(`   ✅ Removed index: ${indexName}`);
            } catch (error) {
                console.log(`   ⚠️  Could not remove ${indexName}: ${error.message}`);
            }
        }
        
        const finalIndexes = await db.query(
            `SHOW INDEX FROM ms_user`,
            { type: QueryTypes.SELECT }
        );
        
        console.log(`📊 Final index count: ${finalIndexes.length}`);
        
        if (finalIndexes.length > 64) {
            console.warn('⚠️  Warning: Still over 64 indexes limit');
            console.log('   Consider removing more indexes manually:');
            
            finalIndexes.forEach(index => {
                console.log(`   - ${index.Key_name} (${index.Column_name})`);
            });
        } else {
            console.log('✅ Index cleanup completed successfully');
        }
        
    } catch (error) {
        console.error('❌ Error during index cleanup:', error);
    } finally {
        await db.close();
    }
}

cleanupUserIndexes();