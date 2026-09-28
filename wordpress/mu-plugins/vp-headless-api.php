<?php
/**
 * Plugin Name: VP Headless API
 * Description: REST fields the vp-associates.com static site reads at build time. Must-use so it cannot be switched off from the admin.
 * Version: 1.0.0
 *
 * Deployed to wp-content/mu-plugins/ on the CMS. Source of truth: vp-eng-nuxt/wordpress/mu-plugins/.
 * Moved here from the old `vp` theme's functions.php during the 2026-09-28 security cleanup.
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * project_pdfs_resolved: each entry of the `project_pdfs` meta with public URLs.
 * [{ title, url, thumbnail }] where thumbnail is the explicit preview image,
 * or WordPress's generated preview of the PDF.
 */
add_action('rest_api_init', function () {
    register_rest_field('project', 'project_pdfs_resolved', array(
        'get_callback' => function ($post) {
            $pdfs = get_post_meta($post['id'], 'project_pdfs', true);
            if (empty($pdfs) || !is_array($pdfs)) {
                return array();
            }

            $upload_base = wp_upload_dir()['baseurl'];
            $result = array();
            foreach ($pdfs as $pdf) {
                $pdf_url = '';
                $preview_url = '';
                $attached = '';

                if (!empty($pdf['pdf_id'])) {
                    $attached = get_post_meta($pdf['pdf_id'], '_wp_attached_file', true);
                    if ($attached) {
                        $pdf_url = $upload_base . '/' . $attached;
                    } else {
                        $post_obj = get_post($pdf['pdf_id']);
                        if ($post_obj) {
                            $pdf_url = $post_obj->guid;
                        }
                    }
                }

                // Fallback: the preview image WordPress generates for the PDF
                if ($attached) {
                    $meta = wp_get_attachment_metadata($pdf['pdf_id']);
                    if (!empty($meta['sizes']['large']['file'])) {
                        $preview_url = $upload_base . '/' . dirname($attached) . '/' . $meta['sizes']['large']['file'];
                    } elseif (!empty($meta['sizes']['medium']['file'])) {
                        $preview_url = $upload_base . '/' . dirname($attached) . '/' . $meta['sizes']['medium']['file'];
                    }
                }

                // An explicit preview image wins
                if (!empty($pdf['preview_id'])) {
                    $preview_attached = get_post_meta($pdf['preview_id'], '_wp_attached_file', true);
                    if ($preview_attached) {
                        $preview_url = $upload_base . '/' . $preview_attached;
                    } else {
                        $post_obj = get_post($pdf['preview_id']);
                        if ($post_obj) {
                            $preview_url = $post_obj->guid;
                        }
                    }
                }

                $result[] = array(
                    'title' => isset($pdf['title']) ? $pdf['title'] : '',
                    'url' => $pdf_url,
                    'thumbnail' => $preview_url,
                );
            }
            return $result;
        },
        'schema' => array(
            'type' => 'array',
            'context' => array('view'),
        ),
    ));
});
